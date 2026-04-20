import { describe, it, expect, vi } from 'vitest'
import { getOscTransportActions } from '../../src/actions/osc-transport/oscTransportActions'

function makeMockInstance() {
	const oscApi = {
		send: vi.fn(),
		triggerColumn: vi.fn(),
		compNextCol: vi.fn(),
		compPrevCol: vi.fn(),
		clearAllLayers: vi.fn(),
		clearLayer: vi.fn(),
		connectClip: vi.fn(),
		selectClip: vi.fn(),
		layerNextCol: vi.fn(),
		layerPrevCol: vi.fn(),
		tempoTap: vi.fn(),
		tempoResync: vi.fn(),
		customOsc: vi.fn(),
		triggerlayerGroupColumn: vi.fn(),
		layerGroupNextCol: vi.fn(),
		groupPrevCol: vi.fn(),
		clearLayerGroup: vi.fn(),
		bypassLayerGroup: vi.fn(),
		compNextDeck: vi.fn(),
		compPrevDeck: vi.fn(),
	}
	const oscState = {
		scheduleQuickRefresh: vi.fn(),
		getLayer: vi.fn().mockReturnValue({ direction: 2 }),
		getActiveClipColumn: vi.fn().mockReturnValue(1),
		getLayerDurationSeconds: vi.fn().mockReturnValue(60),
		getLayerElapsedSeconds: vi.fn().mockReturnValue(0),
		queryAllLayers: vi.fn(),
		compositionDirection: 2,
		groupDirections: new Map<number, number>([[1, 2], [2, 2]]),
	}
	return {
		log: vi.fn(),
		getOscApi: vi.fn().mockReturnValue(oscApi),
		getOscState: vi.fn().mockReturnValue(oscState),
		parseVariablesInString: vi.fn().mockImplementation((s: string) => Promise.resolve(s)),
		_oscApi: oscApi,
		_oscState: oscState,
	} as any
}

// ── oscCompositionDirection ───────────────────────────────────────────────────

describe('oscCompositionDirection', () => {
	it('sends /composition/direction=2 when state=forward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/direction', { type: 'i', value: 2 })
	})

	it('sends /composition/direction=1 when state=pause', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'pause' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/direction', { type: 'i', value: 1 })
	})

	it('sends /composition/direction=0 when state=backward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'backward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/direction', { type: 'i', value: 0 })
	})

	it('sends play (2) on toggle when compositionDirection is paused (1)', async () => {
		const mod = makeMockInstance()
		mod._oscState.compositionDirection = 1
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/direction', { type: 'i', value: 2 })
	})

	it('sends pause (1) on toggle when compositionDirection is playing (2)', async () => {
		const mod = makeMockInstance()
		mod._oscState.compositionDirection = 2
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/direction', { type: 'i', value: 1 })
	})

	it('does not call send when oscApi is null', async () => {
		const mod = makeMockInstance()
		mod.getOscApi.mockReturnValue(null)
		const actions = getOscTransportActions(mod)
		await actions.oscCompositionDirection!.callback({ options: { state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── oscGroupDirection ─────────────────────────────────────────────────────────

describe('oscGroupDirection', () => {
	it('sends /composition/groups/2/direction=2 when group=2 state=forward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: '2', state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/groups/2/direction', { type: 'i', value: 2 })
	})

	it('sends /composition/groups/1/direction=1 when group=1 state=pause', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: '1', state: 'pause' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/groups/1/direction', { type: 'i', value: 1 })
	})

	it('sends /composition/groups/3/direction=0 when group=3 state=backward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: '3', state: 'backward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/groups/3/direction', { type: 'i', value: 0 })
	})

	it('sends play (2) on toggle when group direction is paused (1)', async () => {
		const mod = makeMockInstance()
		mod._oscState.groupDirections.set(1, 1)
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/groups/1/direction', { type: 'i', value: 2 })
	})

	it('sends pause (1) on toggle when group direction is playing (2)', async () => {
		const mod = makeMockInstance()
		mod._oscState.groupDirections.set(2, 2)
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: '2', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/groups/2/direction', { type: 'i', value: 1 })
	})

	it('does nothing when group input is non-numeric', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupDirection!.callback({ options: { group: 'abc', state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── oscClipDirection ──────────────────────────────────────────────────────────

describe('oscClipDirection', () => {
	it('sends direction=2 (forward) to the clip-level path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipDirection!.callback({ options: { layer: '1', column: '2', state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/2/transport/position/behaviour/direction',
			{ type: 'i', value: 2 }
		)
	})

	it('sends direction=1 (pause) to the clip-level path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipDirection!.callback({ options: { layer: '3', column: '1', state: 'pause' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/3/clips/1/transport/position/behaviour/direction',
			{ type: 'i', value: 1 }
		)
	})

	it('sends direction=0 (backward) to the clip-level path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipDirection!.callback({ options: { layer: '2', column: '4', state: 'backward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/2/clips/4/transport/position/behaviour/direction',
			{ type: 'i', value: 0 }
		)
	})

	it('sends the OSC "!" toggle modifier for state=toggle', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipDirection!.callback({ options: { layer: '1', column: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/1/transport/position/behaviour/direction',
			[{ type: 's', value: '!' }]
		)
	})

	it('does nothing when layer input is non-numeric', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipDirection!.callback({ options: { layer: 'x', column: '1', state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── preset toggle action exists ────────────────────────────────────────────────

describe('oscClipPauseResume toggle (play/pause toggle preset)', () => {
	it('sends play (2) when current direction is paused (1)', async () => {
		const mod = makeMockInstance()
		mod._oscState.getLayer.mockReturnValue({ direction: 1 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/layers/1/direction', { type: 'i', value: 2 })
	})

	it('sends pause (1) when current direction is playing (2)', async () => {
		const mod = makeMockInstance()
		mod._oscState.getLayer.mockReturnValue({ direction: 2 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/layers/1/direction', { type: 'i', value: 1 })
	})
})
