import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompositionUtils } from '../../src/domain/composition/composition-utils'
import { parameterStates, compositionState } from '../../src/state'

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		subscribeParam: vi.fn(),
		unsubscribeParam: vi.fn(),
	}
	const instance = {
		checkFeedbacks: vi.fn(),
		setVariableValues: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		_wsApi: wsApi,
	}
	return instance as any
}

function makeFeedback(id = 'fb1') {
	return { id, options: {} } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── messageUpdates — path matching ────────────────────────────────────────────

describe('CompositionUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("compositionMaster") on master path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/master' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('compositionMaster')
	})

	it('calls checkFeedbacks("compositionOpacity") on opacity path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/video/opacity' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('compositionOpacity')
	})

	it('calls checkFeedbacks("compositionVolume") on volume path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/audio/volume' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('compositionVolume')
	})

	it('calls checkFeedbacks("compositionSpeed") on speed path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/speed' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('compositionSpeed')
	})

	it('calls checkFeedbacks("tempo") on tempo path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/tempocontroller/tempo' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('tempo')
	})

	it('does not crash for unrelated path', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/some/other/path' }, false)
		expect(mod.checkFeedbacks).not.toHaveBeenCalled()
	})
})

// ── compositionMasterFeedbackCallback ─────────────────────────────────────────

describe('CompositionUtils.compositionMasterFeedbackCallback', () => {
	it('returns percentage text when master state is set', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		parameterStates.set({ '/composition/master': { value: 0.75 } } as any)
		const result = cu.compositionMasterFeedbackCallback({} as any)
		expect((result as any).text).toBe('75%')
	})

	it('returns "?" when no master state', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		const result = cu.compositionMasterFeedbackCallback({} as any)
		expect((result as any).text).toBe('?')
	})
})

// ── compositionMasterFeedbackSubscribe / unsubscribe ──────────────────────────

describe('CompositionUtils — master subscribe / unsubscribe', () => {
	it('subscribes to /composition/master on first subscribe', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.compositionMasterFeedbackSubscribe(makeFeedback('a'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('does not subscribe twice for second feedback', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.compositionMasterFeedbackSubscribe(makeFeedback('a'))
		cu.compositionMasterFeedbackSubscribe(makeFeedback('b'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('unsubscribes when last subscriber is removed', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.compositionMasterFeedbackSubscribe(makeFeedback('a'))
		cu.compositionMasterFeedbackUnsubscribe(makeFeedback('a'))
		expect(mod._wsApi.unsubscribePath).toHaveBeenCalledWith('/composition/master')
	})

	it('does not unsubscribe while other subscribers remain', () => {
		const mod = makeMockModule()
		const cu = new CompositionUtils(mod)
		cu.compositionMasterFeedbackSubscribe(makeFeedback('a'))
		cu.compositionMasterFeedbackSubscribe(makeFeedback('b'))
		cu.compositionMasterFeedbackUnsubscribe(makeFeedback('a'))
		expect(mod._wsApi.unsubscribePath).not.toHaveBeenCalled()
	})
})

// ── messageUpdates(isComposition=true) — unconditional path subscriptions ─────

describe('CompositionUtils.messageUpdates(isComposition=true) — unconditional subscriptions', () => {
	it('subscribes /composition/master on composition update', () => {
		const mod = { ...makeMockModule(), setupPresets: vi.fn() }
		const cu = new CompositionUtils(mod)
		compositionState.set({} as any)
		cu.messageUpdates({ path: undefined }, true)
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/master')
	})

	it('subscribes /composition/speed on composition update', () => {
		const mod = { ...makeMockModule(), setupPresets: vi.fn() }
		const cu = new CompositionUtils(mod)
		compositionState.set({} as any)
		cu.messageUpdates({ path: undefined }, true)
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/speed')
	})

	it('does NOT subscribe master/speed on non-composition path update', () => {
		const mod = { ...makeMockModule(), setupPresets: vi.fn() }
		const cu = new CompositionUtils(mod)
		cu.messageUpdates({ path: '/composition/master' }, false)
		expect(mod._wsApi.subscribePath).not.toHaveBeenCalledWith('/composition/master')
	})
})
