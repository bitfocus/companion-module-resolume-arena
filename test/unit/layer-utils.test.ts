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

// ── updateActiveLayers — variable writes ──────────────────────────────────────

describe('LayerUtils.updateActiveLayers — variable writes', () => {
	it('sets ws_layer_N_active=1 and ws_layer_N_connected_column=column for a connected layer', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [{}, {}] }, { clips: [{}, {}] }] } as any)
		parameterStates.set({ '/composition/layers/1/clips/2/connect': { value: 'Connected' } } as any)
		lu.updateActiveLayers()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_active: '1',
			ws_layer_1_connected_column: '2',
			ws_layer_2_active: '0',
			ws_layer_2_connected_column: '0',
		}))
	})

	it('sets ws_layer_N_active=0 and connected_column=0 when no clip is connected', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [{}] }] } as any)
		parameterStates.set({} as any)
		lu.updateActiveLayers()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_active: '0',
			ws_layer_1_connected_column: '0',
		}))
	})

	it('calls setupVariables when layer count changes', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ clips: [] }, { clips: [] }, { clips: [] }] } as any)
		lu.updateActiveLayers()
		expect(mod.setupVariables).toHaveBeenCalledTimes(1)
		lu.updateActiveLayers()
		expect(mod.setupVariables).toHaveBeenCalledTimes(1) // same count, no re-call
	})
})

// ── updateLayerVolumes / updateLayerOpacities / updateLayerMasters — unconditional subscribe ──

describe('LayerUtils — unconditional WS subscription on composition update', () => {
	function makeCompositionWithOpacity(layers: number) {
		return {
			layers: Array.from({ length: layers }, (_, i) => ({
				audio: { volume: { id: 100 + i } },
				video: { opacity: { id: 200 + i } },
				clips: [],
			})),
		} as any
	}

	it('updateLayerVolumes subscribes all layers regardless of active feedback subscriptions', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set(makeCompositionWithOpacity(3))
		lu.updateLayerVolumes()
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(100)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(101)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(102)
	})

	it('updateLayerOpacities subscribes all layers regardless of active feedback subscriptions', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set(makeCompositionWithOpacity(2))
		lu.updateLayerOpacities()
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(200)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(201)
	})

	it('updateLayerMasters subscribes /composition/layers/N/master for all layers', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{}, {}, {}] } as any)
		lu.updateLayerMasters()
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/1/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/2/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/3/master')
	})

	it('messageUpdates(isComposition=true) triggers subscribe for all layers', () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		compositionState.set({ layers: [{ audio: { volume: { id: 10 } }, video: { opacity: { id: 20 } }, clips: [] }] } as any)
		lu.messageUpdates({ path: undefined }, true)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(10)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(20)
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layers/1/master')
	})
})
