import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LayerUtils } from '../../src/domain/layers/layer-util'
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
		setupVariables: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		_wsApi: wsApi,
	}
	return instance as any
}

function makeContext(resolved: string) {
	return { parseVariablesInString: vi.fn().mockResolvedValue(resolved) } as any
}

function makeFeedback(layer: string, id = 'fb1') {
	return { id, options: { layer } } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

describe('LayerUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("layerSelected") on select path', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		lu.messageUpdates({ path: '/composition/layers/1/select' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerSelected')
	})

	it('calls checkFeedbacks("layerBypassed") on bypassed path', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		lu.messageUpdates({ path: '/composition/layers/1/bypassed' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerBypassed')
	})

	it('calls checkFeedbacks("layerSolo") on solo path', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		lu.messageUpdates({ path: '/composition/layers/1/solo' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerSolo')
	})

	it('does not call checkFeedbacks for unrelated path', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		lu.messageUpdates({ path: '/composition/tempo' }, false)
		expect(mod.checkFeedbacks).not.toHaveBeenCalled()
	})
})

describe('LayerUtils — bypass subscribe / unsubscribe', () => {
	it('subscribes to WebSocket path on first layerBypassedFeedbackSubscribe call', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'a'), makeContext('1'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/1/bypassed')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('does not subscribe twice for same layer', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'a'), makeContext('1'))
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'b'), makeContext('1'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('calls unsubscribePath when last subscriber is removed', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'a'), makeContext('1'))
		await lu.layerBypassedFeedbackUnsubscribe(makeFeedback('1', 'a'), makeContext('1'))
		expect(mod._wsApi.unsubscribePath).toHaveBeenCalledWith('/composition/layers/1/bypassed')
	})

	it('does not unsubscribe while other subscribers remain', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'a'), makeContext('1'))
		await lu.layerBypassedFeedbackSubscribe(makeFeedback('1', 'b'), makeContext('1'))
		await lu.layerBypassedFeedbackUnsubscribe(makeFeedback('1', 'a'), makeContext('1'))
		expect(mod._wsApi.unsubscribePath).not.toHaveBeenCalled()
	})
})

describe('LayerUtils.updateActiveLayers — variable emission', () => {
	it('emits ws_layer_X_active=0 and ws_layer_X_connected_column=0 when no clip is connected', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [{}] }, { clips: [{}] }] } as any)
		parameterStates.set({})
		lu.updateActiveLayers()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_active: '0',
			ws_layer_1_connected_column: '0',
			ws_layer_2_active: '0',
			ws_layer_2_connected_column: '0',
		}))
	})

	it('emits ws_layer_X_active=1 and connected column index when clip is connected', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [{}, {}] }] } as any)
		parameterStates.set({ '/composition/layers/1/clips/2/connect': { value: 'Connected' } } as any)
		lu.updateActiveLayers()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_active: '1',
			ws_layer_1_connected_column: '2',
		}))
	})

	it('emits ws_layer_X_active=1 for "Connected & previewing" state', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [{}] }] } as any)
		parameterStates.set({ '/composition/layers/1/clips/1/connect': { value: 'Connected & previewing' } } as any)
		lu.updateActiveLayers()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_active: '1',
			ws_layer_1_connected_column: '1',
		}))
	})

	it('does not call setVariableValues when composition state is undefined', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set(undefined)
		lu.updateActiveLayers()
		expect(mod.setVariableValues).not.toHaveBeenCalled()
	})
})

describe('LayerUtils.layerActiveFeedbackCallback', () => {
	it('returns false when layer has no active clip', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		const result = await lu.layerActiveFeedbackCallback(makeFeedback('1'), makeContext('1'))
		expect(result).toBe(false)
	})

	it('returns true when layer has a connected clip', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)

		compositionState.set({ layers: [{ clips: [{}] }] } as any)
		parameterStates.set({ '/composition/layers/1/clips/1/connect': { value: 'Connected' } } as any)

		lu.updateActiveLayers()

		const result = await lu.layerActiveFeedbackCallback(makeFeedback('1'), makeContext('1'))
		expect(result).toBe(true)
	})
})
