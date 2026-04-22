import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClipUtils } from '../../src/domain/clip/clip-utils'
import { parameterStates, compositionState } from '../../src/state'

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		subscribeParam: vi.fn(),
		unsubscribeParam: vi.fn(),
	}
	return {
		checkFeedbacks: vi.fn(),
		setVariableValues: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		getConfig: vi.fn().mockReturnValue({ useCroppedThumbs: false }),
		getClipUtils: vi.fn(),
		getLayerUtils: vi.fn(),
		restApi: undefined,
	} as any
}

function setPosition(layer: number, column: number, value: number, max: number) {
	parameterStates.update(s => {
		s[`/composition/layers/${layer}/clips/${column}/transport/position`] = { value, max } as any
	})
}

function setConnected(layer: number, column: number, state: string) {
	parameterStates.update(s => {
		s[`/composition/layers/${layer}/clips/${column}/connect`] = { value: state } as any
	})
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── wsPositionToSeconds ───────────────────────────────────────────────────────

describe('ClipUtils.wsPositionToSeconds', () => {
	it('returns null when parameterStates has no position entry', () => {
		const cu = new ClipUtils(makeMockModule())
		expect(cu.wsPositionToSeconds(1, 1)).toBeNull()
	})

	it('returns null when max is 0', () => {
		setPosition(1, 1, 0, 0)
		const cu = new ClipUtils(makeMockModule())
		expect(cu.wsPositionToSeconds(1, 1)).toBeNull()
	})

	it('returns null when value is undefined', () => {
		parameterStates.set({ '/composition/layers/1/clips/1/transport/position': { max: 60000 } } as any)
		const cu = new ClipUtils(makeMockModule())
		expect(cu.wsPositionToSeconds(1, 1)).toBeNull()
	})

	it('computes correct elapsed/total/remaining for a 297s clip at start', () => {
		setPosition(1, 1, 0, 297000)
		const cu = new ClipUtils(makeMockModule())
		const result = cu.wsPositionToSeconds(1, 1)!
		expect(result.elapsedSec).toBe(0)
		expect(result.totalSec).toBeCloseTo(297)
		expect(result.remainingSec).toBeCloseTo(297)
	})

	it('computes correct elapsed/total/remaining at midpoint', () => {
		setPosition(1, 1, 148500, 297000)
		const cu = new ClipUtils(makeMockModule())
		const result = cu.wsPositionToSeconds(1, 1)!
		expect(result.elapsedSec).toBeCloseTo(148.5)
		expect(result.totalSec).toBeCloseTo(297)
		expect(result.remainingSec).toBeCloseTo(148.5)
	})

	it('clamps remainingSec to 0 when value exceeds max', () => {
		setPosition(1, 1, 310000, 297000)
		const cu = new ClipUtils(makeMockModule())
		const result = cu.wsPositionToSeconds(1, 1)!
		expect(result.remainingSec).toBe(0)
	})
})

// ── updateWsLayerTimingVariables via messageUpdates ───────────────────────────

describe('ClipUtils — ws_layer_N_* variables via messageUpdates', () => {
	it('does not set variables when clip is not Connected', () => {
		setPosition(1, 1, 60000, 120000)
		setConnected(1, 1, 'Disconnected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position', value: 60000 }, false)
		const calls = mod.setVariableValues.mock.calls.flat()
		expect(calls.some((c: any) => 'ws_layer_1_elapsed_seconds' in c)).toBe(false)
	})

	it('sets all ws_layer_N_* variables when clip is Connected', () => {
		setPosition(1, 1, 60000, 120000)
		setConnected(1, 1, 'Connected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position', value: 60000 }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_1_elapsed_seconds: '60',
			ws_layer_1_remaining_seconds: '60',
			ws_layer_1_duration: '02:00',
			ws_layer_1_elapsed: '01:00',
			ws_layer_1_remaining: '01:00',
			ws_layer_1_progress: '50',
		}))
	})

	it('sets variables when clip is ConnectedAndSelected', () => {
		setPosition(2, 3, 0, 300000)
		setConnected(2, 3, 'ConnectedAndSelected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/2/clips/3/transport/position', value: 0 }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layer_2_elapsed_seconds: '0',
			ws_layer_2_remaining_seconds: '300',
		}))
	})

	it('does not trigger variable update for transport/position sub-paths', () => {
		setPosition(1, 1, 60000, 120000)
		setConnected(1, 1, 'Connected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position/behaviour/speed', value: 1 }, false)
		const calls = mod.setVariableValues.mock.calls.flat()
		expect(calls.some((c: any) => 'ws_layer_1_elapsed_seconds' in c)).toBe(false)
	})

	it('progress is 0 when at start', () => {
		setPosition(1, 1, 0, 297000)
		setConnected(1, 1, 'Connected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position', value: 0 }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({ ws_layer_1_progress: '0' }))
	})

	it('progress is 100 when at end', () => {
		setPosition(1, 1, 297000, 297000)
		setConnected(1, 1, 'Connected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position', value: 297000 }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({ ws_layer_1_progress: '100' }))
	})
})

// ── wsSecondsToTimecode (via variable output) ─────────────────────────────────

describe('ClipUtils — ws_layer_N_elapsed timecode format', () => {
	function getElapsed(elapsedMs: number, totalMs: number): string {
		setPosition(1, 1, elapsedMs, totalMs)
		setConnected(1, 1, 'Connected')
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/transport/position', value: elapsedMs }, false)
		const call = mod.setVariableValues.mock.calls.find((c: any[]) => 'ws_layer_1_elapsed' in c[0])
		return call?.[0]?.ws_layer_1_elapsed ?? ''
	}

	it('formats sub-minute as MM:SS', () => {
		expect(getElapsed(65000, 300000)).toBe('01:05')
	})

	it('formats over one hour as H:MM:SS', () => {
		expect(getElapsed(3661000, 7200000)).toBe('1:01:01')
	})

	it('formats zero as 00:00', () => {
		expect(getElapsed(0, 300000)).toBe('00:00')
	})
})

// ── ws-variables definitions ──────────────────────────────────────────────────

describe('getAllWsVariables', () => {
	it('falls back to defaults (10 layers × 8 + 5 groups × 2) when compositionState is undefined', async () => {
		compositionState.set(undefined)
		const { getAllWsVariables } = await import('../../src/variables/ws-variables')
		const vars = getAllWsVariables()
		expect(vars).toHaveLength(90) // 10 × 8 + 5 × 2
	})

	it('uses actual layer and group counts from compositionState', async () => {
		compositionState.set({ layers: [{}, {}, {}], layergroups: [{}, {}] } as any)
		const { getAllWsVariables } = await import('../../src/variables/ws-variables')
		const vars = getAllWsVariables()
		expect(vars).toHaveLength(3 * 8 + 2 * 2) // 3 layers × 8 + 2 groups × 2
		compositionState.set(undefined)
	})

	it('includes elapsed_seconds and remaining_seconds for layer 1', async () => {
		const { getAllWsVariables } = await import('../../src/variables/ws-variables')
		const ids = getAllWsVariables().map(v => v.variableId)
		expect(ids).toContain('ws_layer_1_elapsed_seconds')
		expect(ids).toContain('ws_layer_1_remaining_seconds')
	})
})
