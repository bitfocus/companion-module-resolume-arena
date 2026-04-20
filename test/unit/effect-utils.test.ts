import {describe, it, expect, vi, beforeEach} from 'vitest';
import {EffectUtils} from '../../src/domain/effects/effect-utils';
import {compositionState} from '../../src/state';

function makeMockModule() {
	return {
		checkFeedbacks: vi.fn(),
		log: vi.fn(),
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
		expect(eu.getEffectBypassedParamId(1, 1)).toBe(201);
		expect(eu.getEffectBypassedParamId(1, 2)).toBe(202);
	});

	it('returns undefined when compositionState is undefined', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectBypassedParamId(1, 1)).toBeUndefined();
	});

	it('returns undefined for out-of-range effect index', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectBypassedParamId(1, 99)).toBeUndefined();
	});
});

describe('EffectUtils.getEffectParamId', () => {
	it('returns param id from params collection', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId(1, 1, 'params', 'look')).toBe(301);
		expect(eu.getEffectParamId(1, 1, 'params', 'speed')).toBe(302);
	});

	it('returns undefined for unknown param name', () => {
		compositionState.set(makeComposition());
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId(1, 1, 'params', 'nonexistent')).toBeUndefined();
	});

	it('returns undefined when composition is undefined', () => {
		const eu = new EffectUtils(makeMockModule());
		expect(eu.getEffectParamId(1, 1, 'params', 'look')).toBeUndefined();
	});
});

describe('EffectUtils.messageUpdates', () => {
	it('calls checkFeedbacks on composition update', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '', value: ''}, true);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectBypassed');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameter');
	});

	it('does not call checkFeedbacks on non-composition parameter update', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/bypassed', value: true}, false);
		expect(mod.checkFeedbacks).not.toHaveBeenCalled();
	});
});

describe('EffectUtils.effectsUpdated', () => {
	it('calls checkFeedbacks for effect feedbacks', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.effectsUpdated();
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectBypassed');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameter');
	});
});
