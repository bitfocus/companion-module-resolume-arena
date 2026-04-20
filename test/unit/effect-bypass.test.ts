import {describe, it, expect, vi, beforeEach} from 'vitest';
import {EffectUtils} from '../../src/domain/effects/effect-utils';
import {parameterStates, compositionState} from '../../src/state';

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		setPath: vi.fn(),
	};
	return {
		checkFeedbacks: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		parseVariablesInString: vi.fn((s: string) => Promise.resolve(s)),
		_wsApi: wsApi,
	} as any;
}

function makeFeedback(layer: string, effectIdx: string, id = 'fb1') {
	return {id, options: {layer, effectIdx}} as any;
}

beforeEach(() => {
	parameterStates.set({});
	compositionState.set(undefined);
});

describe('EffectUtils — bypass subscribe / unsubscribe', () => {
	it('subscribes to WS path on first effectBypassedFeedbackSubscribe', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('2')} as any;
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '2', 'a'), ctx);
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/1/video/effects/2/bypassed');
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1);
	});

	it('does not subscribe twice for same layer+effect', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const ctx1 = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		const ctx2 = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '1', 'a'), ctx1);
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '1', 'b'), ctx2);
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1);
	});

	it('unsubscribes from WS path when last feedback unsubscribes', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const sub = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		const unsub = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '1', 'a'), sub);
		await eu.effectBypassedFeedbackUnsubscribe(makeFeedback('1', '1', 'a'), unsub);
		expect(mod._wsApi.unsubscribePath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/bypassed');
	});

	it('does not unsubscribe while other feedbacks remain', async () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		const mkCtx = () => ({parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any);
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '1', 'a'), mkCtx());
		await eu.effectBypassedFeedbackSubscribe(makeFeedback('1', '1', 'b'), mkCtx());
		await eu.effectBypassedFeedbackUnsubscribe(makeFeedback('1', '1', 'a'), mkCtx());
		expect(mod._wsApi.unsubscribePath).not.toHaveBeenCalled();
	});
});

describe('EffectUtils — effectBypassedFeedbackCallback', () => {
	it('returns true when parameterStates value is true', async () => {
		parameterStates.set({'/composition/layers/1/video/effects/1/bypassed': {value: true} as any});
		const eu = new EffectUtils(makeMockModule());
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		const result = await eu.effectBypassedFeedbackCallback(makeFeedback('1', '1'), ctx);
		expect(result).toBe(true);
	});

	it('returns false when parameterStates value is false', async () => {
		parameterStates.set({'/composition/layers/2/video/effects/3/bypassed': {value: false} as any});
		const eu = new EffectUtils(makeMockModule());
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('2').mockResolvedValueOnce('3')} as any;
		const result = await eu.effectBypassedFeedbackCallback(makeFeedback('2', '3'), ctx);
		expect(result).toBe(false);
	});

	it('returns false when path not in parameterStates', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('1')} as any;
		const result = await eu.effectBypassedFeedbackCallback(makeFeedback('1', '1'), ctx);
		expect(result).toBe(false);
	});
});

describe('EffectUtils — effectBypassedFeedbackCallback early-return guard', () => {
	it('returns false when layer resolves to 0', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('0').mockResolvedValueOnce('1')} as any;
		expect(await eu.effectBypassedFeedbackCallback(makeFeedback('0', '1'), ctx)).toBe(false);
	});

	it('returns false when effectIdx resolves to 0', async () => {
		const eu = new EffectUtils(makeMockModule());
		const ctx = {parseVariablesInString: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('0')} as any;
		expect(await eu.effectBypassedFeedbackCallback(makeFeedback('1', '0'), ctx)).toBe(false);
	});
});

describe('EffectUtils.messageUpdates — effect bypass path', () => {
	it('calls checkFeedbacks("effectBypassed") on matching bypass path', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/2/bypassed', value: true}, false);
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('effectBypassed');
	});

	it('does not call checkFeedbacks for unrelated path', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/bypassed', value: false}, false);
		expect(mod.checkFeedbacks).not.toHaveBeenCalled();
	});

	it('does not double-fire on composition update — only effectBypassed and effectParameter', () => {
		const mod = makeMockModule();
		const eu = new EffectUtils(mod);
		eu.messageUpdates({path: '/composition/layers/1/video/effects/1/bypassed', value: true}, true);
		const calls = mod.checkFeedbacks.mock.calls.map((c: any[]) => c[0]);
		expect(calls.filter((k: string) => k === 'effectBypassed')).toHaveLength(1);
	});
});

describe('effectBypass action callback', () => {
	it('sets bypassed=true when bypass=on', async () => {
		const mod = makeMockModule();
		parameterStates.set({'/composition/layers/1/video/effects/1/bypassed': {value: false} as any});
		const {effectBypass} = await import('../../src/actions/effect/actions/effect-bypass');
		const action = effectBypass({...mod, getWebsocketApi: () => mod._wsApi} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', bypass: 'on'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/bypassed', true);
	});

	it('sets bypassed=false when bypass=off', async () => {
		const mod = makeMockModule();
		parameterStates.set({'/composition/layers/1/video/effects/1/bypassed': {value: true} as any});
		const {effectBypass} = await import('../../src/actions/effect/actions/effect-bypass');
		const action = effectBypass({...mod, getWebsocketApi: () => mod._wsApi} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', bypass: 'off'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/bypassed', false);
	});

	it('toggles bypassed when bypass=toggle', async () => {
		const mod = makeMockModule();
		parameterStates.set({'/composition/layers/1/video/effects/1/bypassed': {value: false} as any});
		const {effectBypass} = await import('../../src/actions/effect/actions/effect-bypass');
		const action = effectBypass({...mod, getWebsocketApi: () => mod._wsApi} as any);
		await (action.callback as Function)({options: {layer: '1', effectIdx: '1', bypass: 'toggle'}});
		expect(mod._wsApi.setPath).toHaveBeenCalledWith('/composition/layers/1/video/effects/1/bypassed', true);
	});

	it('does nothing when websocketApi is null', async () => {
		const mod = {...makeMockModule(), getWebsocketApi: () => null};
		const {effectBypass} = await import('../../src/actions/effect/actions/effect-bypass');
		const action = effectBypass(mod as any);
		await expect((action.callback as Function)({options: {layer: '1', effectIdx: '1', bypass: 'on'}})).resolves.not.toThrow();
	});
});
