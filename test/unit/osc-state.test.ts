import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OscState } from '../../src/osc-state'

function makeMockInstance() {
	const oscListener = { send: vi.fn() }
	return {
		log: vi.fn(),
		setVariableValues: vi.fn(),
		checkFeedbacks: vi.fn(),
		registerOscVariables: vi.fn(),
		getOscListener: vi.fn().mockReturnValue(oscListener),
		getConfig: vi.fn().mockReturnValue({ host: 'localhost', port: 7000 }),
		_oscListener: oscListener,
	} as any
}

describe('OscState.getActiveClipColumn', () => {
	it('returns undefined when layer has no state', () => {
		const state = new OscState(makeMockInstance())
		expect(state.getActiveClipColumn(1)).toBeUndefined()
	})

	it('returns undefined when layer state has activeClip === 0', () => {
		const state = new OscState(makeMockInstance())
		state.getOrCreateLayer(1)
		expect(state.getActiveClipColumn(1)).toBeUndefined()
	})

	it('returns the active column after a connect message', () => {
		const state = new OscState(makeMockInstance())
		state.handleMessage('/composition/layers/1/clips/3/connected', 2)
		expect(state.getActiveClipColumn(1)).toBe(3)
	})

	it('returns undefined after the active clip is disconnected', () => {
		const state = new OscState(makeMockInstance())
		state.handleMessage('/composition/layers/1/clips/3/connected', 2)
		state.handleMessage('/composition/layers/1/clips/3/connected', 0)
		expect(state.getActiveClipColumn(1)).toBeUndefined()
	})
})

describe('OscState.getLayerDurationSeconds', () => {
	it('returns 0 when layer has no state', () => {
		const state = new OscState(makeMockInstance())
		expect(state.getLayerDurationSeconds(1)).toBe(0)
	})

	it('returns 0 when duration has not been received', () => {
		const state = new OscState(makeMockInstance())
		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		expect(state.getLayerDurationSeconds(1)).toBe(0)
	})

	it('returns duration in seconds after receiving duration message', () => {
		const state = new OscState(makeMockInstance())
		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		// duration value is normalized (0-1); maxRange is 604800 seconds (7 days)
		const normalizedDuration = 10 / 604800
		state.handleMessage('/composition/layers/1/clips/1/transport/position/behaviour/duration', normalizedDuration)
		expect(state.getLayerDurationSeconds(1)).toBeCloseTo(10, 3)
	})
})

describe('OscState.getLayerElapsedSeconds', () => {
	it('returns 0 when layer has no state', () => {
		const state = new OscState(makeMockInstance())
		expect(state.getLayerElapsedSeconds(1)).toBe(0)
	})

	it('returns elapsed time in seconds when data is present', () => {
		const state = new OscState(makeMockInstance())
		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		const duration = 60 / 604800
		state.handleMessage('/composition/layers/1/clips/1/transport/position/behaviour/duration', duration)
		// Manually set position via layer position + transport position
		state.handleMessage('/composition/layers/1/position', 0.5)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', 0.5)
		expect(state.getLayerElapsedSeconds(1)).toBeCloseTo(30, 1)
	})
})

describe('OscState.scheduleQuickRefresh', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('fires OSC queries after 200ms debounce', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		state.scheduleQuickRefresh()
		expect(mod._oscListener.send).not.toHaveBeenCalled()
		vi.advanceTimersByTime(200)
		expect(mod._oscListener.send).toHaveBeenCalled()
	})

	it('debounces multiple calls to a single fire', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		state.scheduleQuickRefresh()
		state.scheduleQuickRefresh()
		state.scheduleQuickRefresh()
		vi.advanceTimersByTime(200)
		// Each query address fires one send — but only one round of sends
		const callCount = mod._oscListener.send.mock.calls.length
		// Multiple addresses are sent in one timeout callback
		expect(callCount).toBeGreaterThanOrEqual(1)
		// Advance again — no second fire
		vi.advanceTimersByTime(200)
		expect(mod._oscListener.send.mock.calls.length).toBe(callCount)
	})
})
