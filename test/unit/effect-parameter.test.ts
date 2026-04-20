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
		setPath: vi.fn(),
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

function makeFeedback(layer: string, effectIdx: string, collection: string, paramName: string, id = 'fb1') {
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
	it('subscribes to WS path on first subscribe call', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/speed');
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1);
	});

	it('does not subscribe twice for same path', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'b'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1);
	});

	it('unsubscribes when last feedback unsubscribes', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackUnsubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.unsubscribePath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/speed');
	});

	it('keeps subscription while another feedback still subscribes', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '1', 'params', 'speed', 'b'), makeCtx('1', '1', 'speed'));
		await eu.effectParameterFeedbackUnsubscribe(makeFeedback('1', '1', 'params', 'speed', 'a'), makeCtx('1', '1', 'speed'));
		expect(mod._wsApi.unsubscribePath).not.toHaveBeenCalled();
	});
});

describe('EffectUtils — effectParameterFeedbackCallback', () => {
	it('returns current value as text string', async () => {
		parameterStates.set({'/composition/layers/1/video/effects/1/params/speed': {value: 0.75} as any});
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback(makeFeedback('1', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '0.75'});
	});

	it('returns "?" when path not in parameterStates', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback(makeFeedback('1', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '?'});
	});

	it('returns "?" when layer is 0', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('0', '1', 'speed');
		const result = await eu.effectParameterFeedbackCallback(makeFeedback('0', '1', 'params', 'speed'), ctx);
		expect(result).toMatchObject({text: '?'});
	});

	it('returns "?" when paramName is empty', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = makeCtx('1', '1', '');
		const result = await eu.effectParameterFeedbackCallback(makeFeedback('1', '1', 'params', ''), ctx);
		expect(result).toMatchObject({text: '?'});
	});
});

describe('EffectUtils — effectParameterFeedbackSubscribe guard', () => {
	it('does not subscribe when layer is 0', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('0', '1', 'params', 'speed', 'a'), makeCtx('0', '1', 'speed'));
		expect(mod._wsApi.subscribePath).not.toHaveBeenCalled();
	});

	it('does not subscribe when effectIdx is 0', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		await eu.effectParameterFeedbackSubscribe(makeFeedback('1', '0', 'params', 'speed', 'a'), makeCtx('1', '0', 'speed'));
		expect(mod._wsApi.subscribePath).not.toHaveBeenCalled();
	});
});

describe('EffectUtils.messageUpdates — effectParameter path', () => {
	it('calls checkFeedbacks("effectParameter") on matching params path', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/params/speed', value: 0.5}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameter');
	});

	it('matches mixer collection', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/mixer/opacity', value: 1.0}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameter');
	});

	it('matches effect collection', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/effect/something', value: 0}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectParameter');
	});
});

describe('coerceValue (via effectParameterSet action)', () => {
	it('coerces "true" to boolean true', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({
			...mod,
			getWebsocketApi: () => mod._wsApi,
			getEffectUtils: () => eu,
		} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'active', value: 'true'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/active', true);
	});

	it('coerces "false" to boolean false', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({
			...mod,
			getWebsocketApi: () => mod._wsApi,
			getEffectUtils: () => eu,
		} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'active', value: 'false'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/active', false);
	});

	it('coerces numeric string to number', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({
			...mod,
			getWebsocketApi: () => mod._wsApi,
			getEffectUtils: () => eu,
		} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'speed', value: '0.5'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/speed', 0.5);
	});

	it('passes non-numeric, non-boolean string through', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({
			...mod,
			getWebsocketApi: () => mod._wsApi,
			getEffectUtils: () => eu,
		} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'look', value: 'My Look'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/look', 'My Look');
	});

	it('coerces "0" to number 0, not boolean false', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod as any);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({
			...mod,
			getWebsocketApi: () => mod._wsApi,
			getEffectUtils: () => eu,
		} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'speed', value: '0'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/params/speed', 0);
		expect(typeof mod._wsApi.setPath.mock.calls[0][1]).toBe('number');
	});

	it('does nothing when ws is null', async () => {
		const mod = {...makeMockModule(), getWebsocketApi: () => null};
		const eu = new EffectUtils(mod as any);
		const {effectParameterSet} = await import('../../src/actions/effect/actions/effect-parameter-set');
		const action = effectParameterSet({...mod, getEffectUtils: () => eu} as any);
		await expect((action.callback as Function)({options: {layer: '1', effectIdx: '1', collection: 'params', paramName: 'speed', value: '1'}})).resolves.not.toThrow();
	});
});
