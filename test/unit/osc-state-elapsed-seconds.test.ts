import { describe, it, expect, vi } from 'vitest'
import { OscState } from '../../src/osc-state'

function makeMockInstance() {
	const oscListener = { send: vi.fn() }
	return {
		log: vi.fn(),
		setVariableValues: vi.fn(),
		checkFeedbacks: vi.fn(),
		registerOscVariables: vi.fn(),
		getOscListener: vi.fn().mockReturnValue(oscListener),
		getConfig: vi.fn().mockReturnValue({ host: '127.0.0.1', port: 7000 }),
	} as any
}

const MAX_RANGE = 604800 // Resolume's normalized max in seconds

describe('osc_layer_N_elapsed_seconds variable (#157)', () => {
	it('is set to 0 when no duration data is available', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		// Inject a connected clip and a position — no duration yet
		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		state.handleMessage('/composition/layers/1/position', 0.5)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', 0.5)
		const call = mod.setVariableValues.mock.calls.find((c: any[]) =>
			'osc_layer_1_elapsed_seconds' in c[0]
		)
		expect(call).toBeDefined()
		expect(call[0]['osc_layer_1_elapsed_seconds']).toBe('0')
	})

	it('is set to Math.round(position * duration * maxRange) seconds', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		const durationSec = 120
		const normalizedDuration = durationSec / MAX_RANGE
		const position = 0.25

		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		state.handleMessage('/composition/layers/1/clips/1/transport/position/behaviour/duration', normalizedDuration)
		state.handleMessage('/composition/layers/1/position', position)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', position)

		const calls: any[][] = mod.setVariableValues.mock.calls
		const lastCall = [...calls].reverse().find((c) => 'osc_layer_1_elapsed_seconds' in c[0])
		expect(lastCall).toBeDefined()
		// position=0.25, duration=120s → elapsed=30s
		expect(lastCall![0]['osc_layer_1_elapsed_seconds']).toBe('30')
	})

	it('updates live as position advances', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		const durationSec = 60
		const normalizedDuration = durationSec / MAX_RANGE

		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		state.handleMessage('/composition/layers/1/clips/1/transport/position/behaviour/duration', normalizedDuration)

		// Advance to 50% → 30s elapsed
		state.handleMessage('/composition/layers/1/position', 0.5)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', 0.5)
		const calls: any[][] = mod.setVariableValues.mock.calls
		const at50 = [...calls].reverse().find((c) => 'osc_layer_1_elapsed_seconds' in c[0])
		expect(at50![0]['osc_layer_1_elapsed_seconds']).toBe('30')

		// Advance to 75% → 45s elapsed
		state.handleMessage('/composition/layers/1/position', 0.75)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', 0.75)
		const at75 = [...mod.setVariableValues.mock.calls].reverse().find((c: any[]) => 'osc_layer_1_elapsed_seconds' in c[0])
		expect(at75![0]['osc_layer_1_elapsed_seconds']).toBe('45')
	})

	it('rounds fractional seconds correctly', () => {
		const mod = makeMockInstance()
		const state = new OscState(mod)
		const durationSec = 10
		const normalizedDuration = durationSec / MAX_RANGE
		// position=0.35 → elapsed=3.5s → rounds to 4
		const position = 0.35

		state.handleMessage('/composition/layers/1/clips/1/connected', 2)
		state.handleMessage('/composition/layers/1/clips/1/transport/position/behaviour/duration', normalizedDuration)
		state.handleMessage('/composition/layers/1/position', position)
		state.handleMessage('/composition/layers/1/clips/1/transport/position', position)

		const calls: any[][] = mod.setVariableValues.mock.calls
		const last = [...calls].reverse().find((c) => 'osc_layer_1_elapsed_seconds' in c[0])
		expect(last![0]['osc_layer_1_elapsed_seconds']).toBe('4')
	})
})
