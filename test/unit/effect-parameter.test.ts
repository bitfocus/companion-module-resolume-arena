import {describe, it, expect, vi, beforeEach} from 'vitest';
import {EffectUtils} from '../../src/domain/effects/effect-utils';
import {parameterStates, compositionState} from '../../src/state';

function makeEffectUtils(mod: any) {
	return new EffectUtils(mod);
}

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		subscribeParam: vi.fn(),
		unsubscribeParam: vi.fn(),
		setPath: vi.fn(),
		setParam: vi.fn(),
	};
	const mod: any = {
		checkFeedbacks: vi.fn(),
		log: vi.fn(),
		rebuildDynamicDefinitions: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		parseVariablesInString: vi.fn((s: string) => Promise.resolve(s)),
		_wsApi: wsApi,
	};
	mod.getEffectUtils = vi.fn().mockImplementation(() => makeEffectUtils(mod));
	return mod;
}

function makeLayerComposition(paramId = 301) {
	return {
		layers: [{
			video: {effects: [{
				id: 100, name: 'stageflow', bypassed: {id: 200},
				params: {
					speed: {id: paramId, value: 0.5, valuetype: 'ParamRange'},
					active: {id: 302, value: false, valuetype: 'ParamBoolean'},
					look: {id: 303, value: 'Warm', valuetype: 'ParamChoice', options: ['Warm', 'Cool']},
				},
				mixer: {
					'Blend Mode': {id: 400, value: 'Alpha', valuetype: 'ParamChoice', options: ['Alpha', 'Add']},
				},
			}]},
			clips: [],
		}],
		columns: [],
	} as any;
}

function makeFeedback(layer: string, effectIdx: string, collection: string, paramName: string, id = 'fb1') {
	// paramName goes to the manual textinput; paramChoice_* is left undefined → falls back to manual
	return {id, options: {layer, effectIdx, collection, paramName}} as any;
}

function makeCtx(layer: string, effectIdx: string, paramName = 'speed') {
	return {
		parseVariablesInString: vi.fn()
			.mockResolvedValueOnce(layer)
			.mockResolvedValueOnce(effectIdx)
			.mockResolvedValueOnce(paramName),
	} as any;
}

beforeEach(() => {
	parameterStates.set({});
	compositionState.set(undefined);
});

describe('EffectUtils — effectParameter subscribe / unsubscribe', () => {
	it('subscribes by param ID on first subscribe call', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(301);
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledTimes(1);
	});

	it('does not subscribe twice for same param id', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'b'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledTimes(1);
	});

	it('unsubscribes by param ID when last feedback unsubscribes', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackUnsubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.unsubscribeParam).toHaveBeenCalledWith(301);
	});

	it('keeps subscription while another feedback still subscribes', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'b'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackUnsubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.unsubscribeParam).not.toHaveBeenCalled();
	});
});

describe('EffectUtils — effectParameterFeedbackCallback', () => {
	it('returns current value from /parameter/by-id/{id} in parameterStates', async () => {
		compositionState.set(makeLayerComposition(301));
		parameterStates.set({'/parameter/by-id/301': {value: 0.75} as any});
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback('layer', makeFeedback('1', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '0.75'});
	});

	it('returns "?" when param not in parameterStates', async () => {
		compositionState.set(makeLayerComposition(301));
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback('layer', makeFeedback('1', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '?'});
	});

	it('returns "?" when param not found in compositionState', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback('layer', makeFeedback('1', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '?'});
	});

	it('returns "?" when layer is 0', async () => {
		compositionState.set(makeLayerComposition(301));
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('0', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback('layer', makeFeedback('0', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '?'});
	});

	it('returns "?" when paramName is empty', async () => {
		compositionState.set(makeLayerComposition(301));
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', '');
		const result = await eu.effectParameterFeedbackCallback('layer', makeFeedback('1', '1', 'params', ''), ctx);
		expect(result).toMatchObject({text: '?'});
	});
});

describe('EffectUtils — effectParameterFeedbackSubscribe guard', () => {
	it('does not subscribe when layer is 0', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('0', '1', 'params', 'speed', 'a'), makeCtx('0', '1', 'speed'));
		expect(mod._wsApi.subscribeParam).not.toHaveBeenCalled();
	});

	it('does not subscribe when effectIdx is 0', async () => {
		compositionState.set(makeLayerComposition(301));
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '0', 'params', 'speed', 'a'), makeCtx('1', '0', 'speed'));
		expect(mod._wsApi.subscribeParam).not.toHaveBeenCalled();
	});

	it('does not subscribe when param not in compositionState', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe('layer', makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.subscribeParam).not.toHaveBeenCalled();
	});
});

describe('EffectUtils.messageUpdates — effectParameter path', () => {
	it('calls checkFeedbacks for all parameter variants on matching params path', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/params/speed', value: 0.5}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterLayer');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterClip');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterGroup');
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterComposition');
	});

	it('matches mixer collection', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/mixer/opacity', value: 1.0}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterLayer');
	});

	it('matches effect collection', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/effect/something', value: 0}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameterLayer');
	});
});

describe('coerceValue (via effectParameterSet action)', () => {
	async function makeAction(mod: any) {
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		return effectParameterSet({...mod, getWebsocketApi: () => mod._wsApi, getEffectUtils: () => eu} as any, 'layer');
	}

	beforeEach(() => { compositionState.set(makeLayerComposition(301)); });

	const BASE_MANUAL = {effectChoice: '__manual__', layer: '1', effectIdx: '1', collection: 'params', paramChoice_params: '__manual_param__'};

	it('coerces "true" to boolean true', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'active', value: 'true'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('302', true);
	});

	it('coerces "false" to boolean false', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'active', value: 'false'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('302', false);
	});

	it('coerces numeric string to number', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'speed', value: '0.5'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', 0.5);
	});

	it('passes non-numeric, non-boolean string through', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'look', value: 'My Look'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('303', 'My Look');
	});

	it('coerces "0" to number 0, not boolean false', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'speed', value: '0'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', 0);
		expect(typeof mod._wsApi.setParam.mock.calls[0][1]).toBe('number');
	});

	it('uses valueChoice_params when not manual sentinel', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'look', mode: 'set', valueChoice_params: 'Warm', value: ''}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('303', 'Warm');
	});

	it('targets mixer collection directly via collection + paramChoice_mixer', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {
			effectChoice: '__manual__', layer: '1', effectIdx: '1',
			collection: 'mixer', paramChoice_mixer: 'Blend Mode',
			mode: 'set', valueChoice_mixer: '__manual_value__', value: 'Add',
		}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('400', 'Add');
	});

	it('logs warning when param not found in compositionState', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_MANUAL, paramName: 'nonexistent', value: '1'}});
		expect(mod.log).toHaveBeenCalledWith('warn', expect.stringContaining('nonexistent'));
		expect(mod._wsApi.setParam).not.toHaveBeenCalled();
	});

	it('does nothing when ws is null', async () => {
		const mod = {...makeMockModule(), getWebsocketApi: () => null};
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({...mod, getEffectUtils: () => new EffectUtils(mod as any)} as any, 'layer');
		await expect((action.callback as Function)({options: {...BASE_MANUAL, paramName: 'speed', value: '1'}})).resolves.not.toThrow();
	});
});

describe('effectParameterSet — relative modes', () => {
	beforeEach(() => {
		compositionState.set(makeLayerComposition(301));
		parameterStates.set({});
	});

	async function makeAction(mod: any) {
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		return effectParameterSet({...mod, getWebsocketApi: () => mod._wsApi, getEffectUtils: () => eu} as any, 'layer');
	}

	const BASE_OPTS = {effectChoice: '__manual__', layer: '1', effectIdx: '1', collection: 'params', paramChoice_params: '__manual_param__', paramName: 'speed', valueChoice_params: '__manual_value__'};

	it('increase adds delta to current numeric value from parameterStates', async () => {
		parameterStates.set({'/parameter/by-id/301': {value: 0.3} as any});
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'increase', value: '0.1'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', expect.closeTo(0.4, 10));
	});

	it('decrease subtracts delta from current numeric value from parameterStates', async () => {
		parameterStates.set({'/parameter/by-id/301': {value: 0.5} as any});
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'decrease', value: '0.2'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', expect.closeTo(0.3, 10));
	});

	it('falls back to compositionState value when parameterStates has no entry', async () => {
		// speed param has value 0.5 in makeLayerComposition
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'increase', value: '0.1'}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', expect.closeTo(0.6, 10));
	});

	it('writes back new value to parameterStates so repeated presses accumulate', async () => {
		const mod = makeMockModule();
		const action = await makeAction(mod);
		// First press: base = compositionState value (0.5), result = 0.4
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'decrease', value: '0.1'}});
		expect(mod._wsApi.setParam).toHaveBeenLastCalledWith('301', expect.closeTo(0.4, 10));
		// Second press: base = 0.4 from parameterStates cache, result = 0.3
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'decrease', value: '0.1'}});
		expect(mod._wsApi.setParam).toHaveBeenLastCalledWith('301', expect.closeTo(0.3, 10));
	});

	it('toggle flips boolean using parameterStates value', async () => {
		parameterStates.set({'/parameter/by-id/301': {value: true} as any});
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'toggle', value: ''}});
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', false);
	});

	it('toggle falls back to compositionState value', async () => {
		// speed has value 0.5 (falsy-ish as boolean is false) — compositionState
		const mod = makeMockModule();
		const action = await makeAction(mod);
		await (action.callback as Function)({options: {...BASE_OPTS, mode: 'toggle', value: ''}});
		// !0.5 === false
		expect(mod._wsApi.setParam).toHaveBeenCalledWith('301', false);
	});
});
