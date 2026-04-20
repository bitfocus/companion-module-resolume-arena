/**
 * Integration tests for effect control and feedback (#159).
 *
 * Test composition (layer 1, clip 1/1):
 * - Layer 1 has 1 effect: Transform (no bypassed parameter)
 * - Clip 1/1 has 4 effects: Transform + 3× AddSubtract (effects 2–4 have bypassed)
 *
 * Note: current EffectUtils is layer-scoped (PR 1–3). Clip-scope tests use raw WS
 * paths to validate the bypass toggle mechanism; clip-scope EffectUtils is PR 4.
 *
 * The REST API returns effect fields in snake_case (display_name, not displayName).
 * The TypeScript interfaces use camelCase — bypassedParamId therefore comes from
 * the WS composition dump (camelCase), not from the REST response.
 */
import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import ArenaRestApi from '../../src/arena-api/rest';
import {WebsocketInstance} from '../../src/websocket';
import {compositionState, parameterStates} from '../../src/state';
import {EffectUtils} from '../../src/domain/effects/effect-utils';
import {ClipId} from '../../src/domain/clip/clip-id';
import {TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN} from './config';
import {isResolumeReachable, pause, waitFor} from './helpers';

const resolume = await isResolumeReachable();

const api = new ArenaRestApi(TEST_HOST, REST_PORT);

let ws: WebsocketInstance;
let effectUtils: EffectUtils;

const mockInstance: any = {
	log: () => {},
	updateStatus: () => {},
	getWebSocketSubscribers: () => new Set([effectUtils]),
	restartApis: async () => {},
	checkFeedbacks: () => {},
	rebuildDynamicDefinitions: () => {},
	getWebsocketApi: () => ws,
	parseVariablesInString: (s: string) => Promise.resolve(s),
};

const mockConfig: any = {host: TEST_HOST, webapiPort: REST_PORT, useSSL: false};

beforeAll(async () => {
	if (!resolume) return;
	effectUtils = new EffectUtils(mockInstance);
	ws = new WebsocketInstance(mockInstance, mockConfig);
	await ws.waitForWebsocketReady();
	await waitFor(() => compositionState.get() !== undefined, 5000);
	await pause(200);
});

afterAll(async () => {
	if (ws) await ws.destroy();
});

// ── REST data contract — layer effects ────────────────────────────────────────

describe.skipIf(!resolume)('effect control — REST: layer effects structure', () => {
	it('layer has video.effects array', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		expect(Array.isArray(layer?.video?.effects)).toBe(true);
	});

	it('layer has at least 1 effect', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		expect(layer?.video?.effects?.length).toBeGreaterThanOrEqual(1);
	});

	it('each layer effect has numeric id and string name', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		for (const effect of layer?.video?.effects ?? []) {
			expect(typeof effect.id).toBe('number');
			expect(typeof effect.name).toBe('string');
		}
	});

	it('layer effect params have numeric ids', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		const firstEffect = layer?.video?.effects?.[0];
		if (!firstEffect?.params) return;
		for (const param of Object.values(firstEffect.params) as any[]) {
			expect(typeof param.id).toBe('number');
		}
	});
});

// ── REST data contract — clip effects ─────────────────────────────────────────

describe.skipIf(!resolume)('effect control — REST: clip effects structure', () => {
	it('clip has video.effects array', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any;
		expect(Array.isArray(clip?.video?.effects)).toBe(true);
	});

	it('clip has at least 1 effect with bypassed parameter', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any;
		const withBypassed = (clip?.video?.effects ?? []).filter((e: any) => e.bypassed?.id !== undefined);
		expect(withBypassed.length).toBeGreaterThanOrEqual(1);
	});

	it('clip effect bypassed has numeric id', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any;
		const withBypassed = (clip?.video?.effects ?? []).filter((e: any) => e.bypassed?.id !== undefined);
		for (const effect of withBypassed) {
			expect(typeof effect.bypassed.id).toBe('number');
			expect(typeof effect.bypassed.value).toBe('boolean');
		}
	});
});

// ── EffectUtils.listEffects from compositionState ─────────────────────────────

describe.skipIf(!resolume)('effect control — EffectUtils.listEffects (layer scope)', () => {
	it('compositionState is populated after connect', () => {
		expect(compositionState.get()).toBeDefined();
	});

	it('listEffects returns at least 1 effect for TEST_LAYER', () => {
		const effects = effectUtils.listEffects(TEST_LAYER);
		expect(effects.length).toBeGreaterThanOrEqual(1);
	});

	it('idx values are 1-based and sequential', () => {
		const effects = effectUtils.listEffects(TEST_LAYER);
		effects.forEach((e, i) => expect(e.idx).toBe(i + 1));
	});

	it('each effect has numeric id and non-empty name', () => {
		const effects = effectUtils.listEffects(TEST_LAYER);
		for (const e of effects) {
			expect(typeof e.id).toBe('number');
			expect(e.name.length).toBeGreaterThan(0);
		}
	});

	it('listEffects returns empty for out-of-range layer', () => {
		expect(effectUtils.listEffects(9999)).toEqual([]);
	});
});

// ── WS param subscription — layer effect ─────────────────────────────────────

describe.skipIf(!resolume)('effect control — WS: layer effect param subscription', () => {
	let paramPath: string;

	beforeAll(async () => {
		// Use the first param of the first layer effect (Transform → "Position X")
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		const firstEffect = layer?.video?.effects?.[0];
		const firstParamName = firstEffect?.params ? Object.keys(firstEffect.params)[0] : null;
		if (!firstParamName) return;
		paramPath = effectUtils.effectParamPath(TEST_LAYER, 1, 'params', firstParamName);
		parameterStates.set({});
		ws.subscribePath(paramPath);
		await waitFor(() => parameterStates.get()[paramPath] !== undefined, 3000);
	});

	it('parameterStates contains the param entry after subscription', () => {
		if (!paramPath) return;
		expect(parameterStates.get()[paramPath]).toBeDefined();
	});

	it('param value matches REST value', async () => {
		if (!paramPath) return;
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any;
		const firstEffect = layer?.video?.effects?.[0];
		const firstParamName = firstEffect?.params ? Object.keys(firstEffect.params)[0] : null;
		if (!firstParamName) return;
		const restVal = firstEffect.params[firstParamName].value;
		const wsVal = parameterStates.get()[paramPath]?.value;
		expect(wsVal).toBeCloseTo(restVal as number, 3);
	});
});

// ── WS bypass subscription — clip effect (raw path) ──────────────────────────
// Clip-scope EffectUtils is PR 4. Here we verify the raw WS mechanism works
// for the bypassed effects the user added to clip 1/1.

describe.skipIf(!resolume)('effect control — WS: clip effect bypass subscription (raw)', () => {
	let bypassPath: string;
	let bypassedParamId: number;

	beforeAll(async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any;
		// Find first effect with a bypassed parameter (1-based index in WS path)
		const effects: any[] = clip?.video?.effects ?? [];
		const idx = effects.findIndex((e: any) => e.bypassed?.id !== undefined);
		if (idx === -1) return;
		bypassedParamId = effects[idx].bypassed.id;
		bypassPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/video/effects/${idx + 1}/bypassed`;
		parameterStates.set({});
		ws.subscribePath(bypassPath);
		await waitFor(() => parameterStates.get()[bypassPath] !== undefined, 3000);
	});

	it('parameterStates contains the bypassed entry after subscription', () => {
		if (!bypassPath) return;
		expect(parameterStates.get()[bypassPath]).toBeDefined();
	});

	it('bypassed value is a boolean', () => {
		if (!bypassPath) return;
		expect(typeof parameterStates.get()[bypassPath]?.value).toBe('boolean');
	});
});

// ── WS bypass toggle round-trip — clip effect ─────────────────────────────────

describe.skipIf(!resolume)('effect control — WS: clip effect bypass toggle round-trip', () => {
	let bypassPath: string;
	let originalBypassed: boolean;

	beforeAll(async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any;
		const effects: any[] = clip?.video?.effects ?? [];
		const idx = effects.findIndex((e: any) => e.bypassed?.id !== undefined);
		if (idx === -1) return;
		bypassPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/video/effects/${idx + 1}/bypassed`;
		parameterStates.set({});
		ws.subscribePath(bypassPath);
		await waitFor(() => parameterStates.get()[bypassPath] !== undefined, 3000);
		originalBypassed = !!parameterStates.get()[bypassPath]?.value;
	});

	afterAll(async () => {
		if (bypassPath) {
			await ws.setPath(bypassPath, originalBypassed);
			await pause(300);
		}
	});

	it('toggling bypass updates parameterStates via parameter_update', async () => {
		if (!bypassPath) return;
		const toggled = !originalBypassed;
		await ws.setPath(bypassPath, toggled);
		await waitFor(() => parameterStates.get()[bypassPath]?.value === toggled, 3000);
		expect(parameterStates.get()[bypassPath]?.value).toBe(toggled);
	});
});

// ── effectParameterSet action — path construction ─────────────────────────────

describe.skipIf(!resolume)('effect control — effectParameterSet action path construction', () => {
	it('constructs correct layer effect param path and calls ws.setPath', async () => {
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const calls: Array<{path: string; value: any}> = [];
		const fakeWs: any = {setPath: (path: string, value: any) => calls.push({path, value})};
		const fakeInstance: any = {
			log: () => {},
			parseVariablesInString: (s: string) => Promise.resolve(s),
			getWebsocketApi: () => fakeWs,
			getEffectUtils: () => effectUtils,
		};
		const action = effectParameterSet(fakeInstance, 'layer');
		await (action.callback as Function)({
			options: {
				effectChoice: '__manual__',
				layer: String(TEST_LAYER),
				effectIdx: '1',
				collection: 'params',
				paramName: 'Position X',
				value: '10',
			},
		});
		expect(calls).toHaveLength(1);
		expect(calls[0].path).toBe(`/composition/layers/${TEST_LAYER}/video/effects/1/params/Position X`);
		expect(calls[0].value).toBe(10);
	});
});
