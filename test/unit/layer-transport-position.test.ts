import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LayerUtils } from '../../src/domain/layers/layer-util'
import { parameterStates, compositionState } from '../../src/state'

function makeMockModule() {
	return {
		checkFeedbacks: vi.fn(),
		setVariableValues: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue({
			subscribePath: vi.fn(),
			unsubscribePath: vi.fn(),
			subscribeParam: vi.fn(),
			unsubscribeParam: vi.fn(),
		}),
	} as any
}

function makeContext(layer: string) {
	return { parseVariablesInString: vi.fn().mockResolvedValue(layer) } as any
}

function makeFeedback(layer: string, view: string, timeRemaining = false) {
	return { id: 'fb1', options: { layer, view, timeRemaining } } as any
}

function setupActiveLayer(layer: number, column: number) {
	compositionState.set({ layers: [{ clips: [{}] }] } as any)
	parameterStates.set({
		[`/composition/layers/${layer}/clips/${column}/connect`]: { value: 'Connected' },
	} as any)
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

describe('LayerUtils.layerTransportPositionFeedbackCallback', () => {
	it('returns "?" when no active clip for layer', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'fullSeconds'), makeContext('1'))
		expect(result).toEqual({ text: '?' })
	})

	it('fullSeconds view returns formatted seconds string', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		setupActiveLayer(1, 1)
		lu.updateActiveLayers()
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/transport/position': { value: 500, max: 1000 },
		} as any)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'fullSeconds'), makeContext('1'))
		expect((result as any).text).toMatch(/^\d+\.\d+s$/)
	})

	it('timestamp view returns HH:MM:SS format', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		setupActiveLayer(1, 1)
		lu.updateActiveLayers()
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/transport/position': { value: 500, max: 1000 },
		} as any)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'timestamp'), makeContext('1'))
		expect((result as any).text).toMatch(/^\d{2}:\d{2}:\d{2}$/)
	})

	it('timestamp_noHours view returns MM:SS format', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		setupActiveLayer(1, 1)
		lu.updateActiveLayers()
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/transport/position': { value: 500, max: 1000 },
		} as any)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'timestamp_noHours'), makeContext('1'))
		expect((result as any).text).toMatch(/^\d{2}:\d{2}$/)
	})

	it('timeRemaining: true produces a "-" prefix on timestamp', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		setupActiveLayer(1, 1)
		lu.updateActiveLayers()
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/transport/position': { value: 500, max: 1000 },
		} as any)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'timestamp', true), makeContext('1'))
		expect((result as any).text).toMatch(/^-\d{2}:\d{2}:\d{2}$/)
	})

	it('timeRemaining: false produces no leading "-"', async () => {
		const mod = makeMockModule()
		const lu = new LayerUtils(mod)
		setupActiveLayer(1, 1)
		lu.updateActiveLayers()
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/transport/position': { value: 500, max: 1000 },
		} as any)
		const result = await lu.layerTransportPositionFeedbackCallback(makeFeedback('1', 'timestamp', false), makeContext('1'))
		expect((result as any).text).not.toMatch(/^-/)
	})
})
