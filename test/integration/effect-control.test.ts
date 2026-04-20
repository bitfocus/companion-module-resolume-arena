/**
 * Integration tests for effect parameter control (#159).
 *
 * Required test composition (see memory/project_test_setup.md):
 *   - Layer 1 has at least 1 effect (Transform) with numeric params (e.g. "Position X").
 *   - Clip 1/1 has at least 1 effect whose bypassed parameter has a numeric id.
 *
 * These tests use ws.subscribeParam / ws.setParam (the current API).
 * The old setPath mechanism is intentionally NOT tested here — it does not work
 * for effect parameters and was removed in favour of setParam.
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
});

// ── WS subscribeParam — layer effect numeric param ───────────────────────────

describe.skipIf(!resolume)('effect control — WS: subscribeParam for layer effect param', () => {
	let paramId: number;

	beforeAll(async () => {
		const state = compositionState.get();
		const firstEffect = state?.layers?.[TEST_LAYER - 1]?.video?.effects?.[0] as any;
		const entry = Object.values(firstEffect?.params ?? {}).find((p: any) => typeof p.value === 'number') as any;
		if (!entry) return;
		paramId = entry.id;
		parameterStates.set({});
		ws.subscribeParam(paramId);
		await waitFor(() => parameterStates.get()['/parameter/by-id/' + paramId] !== undefined, 3000);
	});

	afterAll(() => {
		if (paramId !== undefined) ws.unsubscribeParam(paramId);
	});

	it('parameterStates contains the param entry after subscribeParam', () => {
		if (paramId === undefined) return;
		expect(parameterStates.get()['/parameter/by-id/' + paramId]).toBeDefined();
	});

	it('subscribed value is numeric', () => {
		if (paramId === undefined) return;
		expect(typeof parameterStates.get()['/parameter/by-id/' + paramId]?.value).toBe('number');
	});
});

// ── effectParameterSet action — set round-trip ────────────────────────────────

describe.skipIf(!resolume)('effect control — effectParameterSet action: set round-trip', () => {
	let paramId: number;
	let paramName: string;
	let originalValue: number;

	beforeAll(async () => {
		const state = compositionState.get();
		const firstEffect = state?.layers?.[TEST_LAYER - 1]?.video?.effects?.[0] as any;
		const params = firstEffect?.params ?? {};
		const [name, entry] = (Object.entries(params) as [string, any][]).find(([, p]) => typeof p.value === 'number') ?? [];
		if (!name || !entry) return;
		paramName = name;
		paramId = entry.id;
		// Subscribe so we can read live values back from Resolume
		parameterStates.set({});
		ws.subscribeParam(paramId);
		await waitFor(() => parameterStates.get()['/parameter/by-id/' + paramId] !== undefined, 3000);
		originalValue = parameterStates.get()['/parameter/by-id/' + paramId]?.value as number;
	});

	afterAll(async () => {
		if (paramId !== undefined) {
			ws.setParam(String(paramId), originalValue);
			await pause(300);
			ws.unsubscribeParam(paramId);
		}
	});

	it('set mode sends value to Resolume via setParam', async () => {
		if (paramId === undefined) return;
		const target = (originalValue + 0.1) % 1; // stay within [0,1]
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({...mockInstance, getEffectUtils: () => effectUtils} as any, 'layer');
		await (action.callback as Function)({
			options: {
				effectChoice: '__manual__',
				layer: String(TEST_LAYER),
				effectIdx: '1',
				collection: 'params',
				paramChoice_params: paramName,
				mode: 'set',
				value: String(target),
			},
		});
		await waitFor(() => Math.abs((parameterStates.get()['/parameter/by-id/' + paramId]?.value as number) - target) < 0.01, 3000);
		expect(parameterStates.get()['/parameter/by-id/' + paramId]?.value).toBeCloseTo(target, 2);
	});
});

// ── effectParameterSet action — increase/decrease accumulation ────────────────

describe.skipIf(!resolume)('effect control — effectParameterSet action: increase/decrease accumulation', () => {
	let paramId: number;
	let paramName: string;
	let originalValue: number;

	beforeAll(async () => {
		const state = compositionState.get();
		const firstEffect = state?.layers?.[TEST_LAYER - 1]?.video?.effects?.[0] as any;
		const params = firstEffect?.params ?? {};
		const [name, entry] = (Object.entries(params) as [string, any][]).find(([, p]) => typeof p.value === 'number') ?? [];
		if (!name || !entry) return;
		paramName = name;
		paramId = entry.id;
		parameterStates.set({});
		ws.subscribeParam(paramId);
		await waitFor(() => parameterStates.get()['/parameter/by-id/' + paramId] !== undefined, 3000);
		originalValue = parameterStates.get()['/parameter/by-id/' + paramId]?.value as number;
	});

	afterAll(async () => {
		if (paramId !== undefined) {
			ws.setParam(String(paramId), originalValue);
			await pause(300);
			ws.unsubscribeParam(paramId);
		}
	});

	it('calling increase twice accumulates — second press uses updated base, not stale compositionState', async () => {
		if (paramId === undefined) return;
		const delta = 0.05;
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({...mockInstance, getEffectUtils: () => effectUtils} as any, 'layer');
		const opts = {
			effectChoice: '__manual__',
			layer: String(TEST_LAYER),
			effectIdx: '1',
			collection: 'params',
			paramChoice_params: paramName,
			mode: 'increase',
			value: String(delta),
		};

		// Reset to a known base value so the test is deterministic
		ws.setParam(String(paramId), originalValue);
		await waitFor(() => Math.abs((parameterStates.get()['/parameter/by-id/' + paramId]?.value as number) - originalValue) < 0.01, 2000);

		await (action.callback as Function)({options: opts});
		const afterFirst = parameterStates.get()['/parameter/by-id/' + paramId]?.value as number;
		expect(afterFirst).toBeCloseTo(originalValue + delta, 3);

		await (action.callback as Function)({options: opts});
		const afterSecond = parameterStates.get()['/parameter/by-id/' + paramId]?.value as number;
		// If the optimistic write-back is missing, afterSecond would equal originalValue + delta (not 2×)
		expect(afterSecond).toBeCloseTo(originalValue + 2 * delta, 3);
	});

	it('decrease is the mirror — repeated presses subtract further', async () => {
		if (paramId === undefined) return;
		const delta = 0.05;
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({...mockInstance, getEffectUtils: () => effectUtils} as any, 'layer');
		const opts = {
			effectChoice: '__manual__',
			layer: String(TEST_LAYER),
			effectIdx: '1',
			collection: 'params',
			paramChoice_params: paramName,
			mode: 'decrease',
			value: String(delta),
		};

		ws.setParam(String(paramId), originalValue);
		await waitFor(() => Math.abs((parameterStates.get()['/parameter/by-id/' + paramId]?.value as number) - originalValue) < 0.01, 2000);

		await (action.callback as Function)({options: opts});
		await (action.callback as Function)({options: opts});
		const afterTwo = parameterStates.get()['/parameter/by-id/' + paramId]?.value as number;
		expect(afterTwo).toBeCloseTo(originalValue - 2 * delta, 3);
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

	it('toggling bypass updates parameterStates via WS', async () => {
		if (!bypassPath) return;
		const toggled = !originalBypassed;
		await ws.setPath(bypassPath, toggled);
		await waitFor(() => parameterStates.get()[bypassPath]?.value === toggled, 3000);
		expect(parameterStates.get()[bypassPath]?.value).toBe(toggled);
	});
});
