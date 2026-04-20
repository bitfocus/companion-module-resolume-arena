import {describe, it, expect, vi, beforeEach} from 'vitest';
import {EffectUtils} from '../../src/domain/effects/effect-utils';
import {compositionState} from '../../src/state';

function makeMockModule() {
	return {
		checkFeedbacks: vi.fn(),
		log: vi.fn(),
		rebuildDynamicDefinitions: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue({
			subscribeParam: vi.fn(),
			unsubscribeParam: vi.fn(),
		}),
	} as any;
}

function makeComposition() {
	return {
		layers: [
			{
				video: {
					effects: [
						{
							id: 101,
							name: 'stageflow',
							displayName: 'StageFlow',
							bypassed: {id: 201, value: false, valuetype: 'ParamBoolean'},
							params: {
								look: {id: 301, value: 0, valuetype: 'ParamChoice'},
								speed: {id: 302, value: 0.5, valuetype: 'ParamRange', min: 0, max: 1},
							},
						},
						{
							id: 102,
							name: 'chaser',
							displayName: 'Chaser',
							bypassed: {id: 202, value: true, valuetype: 'ParamBoolean'},
							params: {
								speed: {id: 303, value: 1.0, valuetype: 'ParamRange', min: 0, max: 2},
							},
						},
					],
				},
			},
		],
		columns: [],
	} as any;
}

beforeEach(() => {
	compositionState.set(undefined);
});

describe('EffectUtils.listEffects', () => {
	it('returns empty array when compositionState is undefined', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.listEffects(1)).toEqual([]);
	});

	it('returns empty array for layer without effects', () => {
		compositionState.set({layers: [{video: {}}], columns: []} as any);
		const eu = new EffectUtils(makeMockModule());
		expect(eu.listEffects(1)).toEqual([]);
	});

	it('returns metadata for all effects on a layer', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		const effects = eu.listEffects(1);
		expect(effects).toHaveLength(2);
		expect(effects[0]).toMatchObject({idx: 1, id: 101, name: 'stageflow', displayName: 'StageFlow', bypassedParamId: 201});
		expect(effects[1]).toMatchObject({idx: 2, id: 102, name: 'chaser', displayName: 'Chaser', bypassedParamId: 202});
	});

	it('returns empty array for out-of-range layer', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.listEffects(99)).toEqual([]);
	});
});

describe('EffectUtils.getEffectBypassedParamId', () => {
	it('returns bypassed param id', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectBypassedParamId('layer', {layer: 1}, 1)).toBe(201);
		expect(eu.getEffectBypassedParamId('layer', {layer: 1}, 2)).toBe(202);
	});

	it('returns undefined when compositionState is undefined', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectBypassedParamId('layer', {layer: 1}, 1)).toBeUndefined();
	});

	it('returns undefined for out-of-range effect index', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectBypassedParamId('layer', {layer: 1}, 99)).toBeUndefined();
	});
});

describe('EffectUtils.getEffectParamId', () => {
	it('returns param id from params collection', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId('layer', {layer: 1}, 1, 'params', 'look')).toBe(301);
		expect(eu.getEffectParamId('layer', {layer: 1}, 1, 'params', 'speed')).toBe(302);
	});

	it('returns undefined for unknown param name', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId('layer', {layer: 1}, 1, 'params', 'nonexistent')).toBeUndefined();
	});

	it('returns undefined when composition is undefined', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId('layer', {layer: 1}, 1, 'params', 'look')).toBeUndefined();
	});
});

describe('EffectUtils.listEffectsForScope', () => {
	function makeMultiScopeComposition() {
		return {
			video: {effects: [{id: 1, name: 'comp-effect', displayName: 'CompFX', bypassed: {id: 10}}]},
			layergroups: [
				{
					name: {value: 'Group 1'},
					video: {effects: [{id: 2, name: 'group-effect', displayName: 'GroupFX', bypassed: {id: 20}}]},
				},
			],
			layers: [
				{
					name: {value: 'Layer 1'},
					video: {effects: [{id: 3, name: 'layer-effect', displayName: 'LayerFX', bypassed: {id: 30}}]},
					clips: [
						{
							name: {value: 'Clip 1'},
							video: {effects: [{id: 4, name: 'clip-effect', displayName: 'ClipFX', bypassed: {id: 40}}]},
						},
					],
				},
			],
			columns: [],
		} as any;
	}

	it('returns composition-level effects', () => {
		compositionState.set(makeMultiScopeComposition());
		const eu = new EffectUtils(makeMockModule());
		const effects = eu.listEffectsForScope('composition', {});
		expect(effects).toHaveLength(1);
		expect(effects[0]).toMatchObject({idx: 1, id: 1, name: 'comp-effect'});
	});

	it('returns layer-group effects', () => {
		compositionState.set(makeMultiScopeComposition());
		const eu = new EffectUtils(makeMockModule());
		const effects = eu.listEffectsForScope('layergroup', {layerGroup: 1});
		expect(effects).toHaveLength(1);
		expect(effects[0]).toMatchObject({idx: 1, id: 2, name: 'group-effect'});
	});

	it('returns clip effects', () => {
		compositionState.set(makeMultiScopeComposition());
		const eu = new EffectUtils(makeMockModule());
		const effects = eu.listEffectsForScope('clip', {layer: 1, column: 1});
		expect(effects).toHaveLength(1);
		expect(effects[0]).toMatchObject({idx: 1, id: 4, name: 'clip-effect'});
	});
});

describe('EffectUtils.effectBypassPath — all scopes', () => {
	it('builds composition path', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.effectBypassPath('composition', {}, 1)).toBe('/composition/video/effects/1/bypassed');
	});

	it('builds layergroup path', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.effectBypassPath('layergroup', {layerGroup: 2}, 1)).toBe('/composition/layergroups/2/video/effects/1/bypassed');
	});

	it('builds layer path', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.effectBypassPath('layer', {layer: 3}, 2)).toBe('/composition/layers/3/video/effects/2/bypassed');
	});

	it('builds clip path', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.effectBypassPath('clip', {layer: 1, column: 2}, 3)).toBe('/composition/layers/1/clips/2/video/effects/3/bypassed');
	});
});

describe('EffectUtils.buildEffectChoices', () => {
	it('returns manual option when composition is empty', () => {
		const eu = new EffectUtils(makeMockModule());
		const choices = eu.buildEffectChoices();
		expect(choices).toHaveLength(1);
		expect(choices[0].id).toBe('__manual__');
	});

	it('includes effects from composition, layergroup and layer scopes (not clip)', () => {
		compositionState.set({
			video: {effects: [{id: 1, name: 'fx', displayName: 'FX'}]},
			layergroups: [{name: {value: 'G1'}, video: {effects: [{id: 2, name: 'gfx', displayName: 'GFX'}]}}],
			layers: [
				{
					name: {value: 'L1'},
					video: {effects: [{id: 3, name: 'lfx', displayName: 'LFX'}]},
					clips: [{name: {value: 'C1'}, video: {effects: [{id: 4, name: 'cfx', displayName: 'CFX'}]}}],
				},
			],
			columns: [],
		} as any);
		const eu = new EffectUtils(makeMockModule());
		const choices = eu.buildEffectChoices();
		const ids = choices.map((c) => String(c.id));
		expect(ids).toContain('__manual__');
		expect(ids.some((id) => id.startsWith('composition:'))).toBe(true);
		expect(ids.some((id) => id.startsWith('layergroup:'))).toBe(true);
		expect(ids.some((id) => id.startsWith('layer:'))).toBe(true);
		// Clip effects are excluded to avoid massive payloads in large compositions
		expect(ids.some((id) => id.startsWith('clip:'))).toBe(false);
	});
});

describe('EffectUtils.decodeEffectChoice', () => {
	it('returns null for manual sentinel', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.decodeEffectChoice('__manual__')).toBeNull();
	});

	it('decodes layer choice', () => {
		const eu = new EffectUtils(makeMockModule());
		const result = eu.decodeEffectChoice('layer:2:0:0:3');
		expect(result).toMatchObject({scope: 'layer', location: {layer: 2}, effectIdx: 3});
	});

	it('decodes clip choice', () => {
		const eu = new EffectUtils(makeMockModule());
		const result = eu.decodeEffectChoice('clip:1:2:0:1');
		expect(result).toMatchObject({scope: 'clip', location: {layer: 1, column: 2}, effectIdx: 1});
	});
});

describe('EffectUtils.messageUpdates', () => {
	it('calls checkFeedbacks for all variants on composition update', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '', value: ''}, true);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectBypassedLayer');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterLayer');
	});

	it('does not call checkFeedbacks on non-composition parameter update', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/bypassed', value: true}, false);
		expect(mod.checkFeedbacks).not.toHaveBeenCalled();
	});
});

describe('EffectUtils.effectsUpdated', () => {
	it('calls checkFeedbacks for all variants and rebuilds definitions', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.effectsUpdated();
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectBypassedLayer');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterLayer');
		expect(mod.rebuildDynamicDefinitions).toHaveBeenCalledTimes(1);
	});
});
