import { describe, it, expect, vi } from 'vitest'
import { getOscTransportActions } from '../../src/actions/osc-transport/oscTransportActions'

function makeMockInstance({
	direction = 2,
	activeColumn = 3,
	durationSec = 60,
	elapsedSec = 10,
}: {
	direction?: number
	activeColumn?: number | undefined
	durationSec?: number
	elapsedSec?: number
} = {}) {
	const oscApi = {
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
		send: vi.fn(),
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
		getLayer: vi.fn().mockReturnValue({ direction }),
		getActiveClipColumn: vi.fn().mockReturnValue(activeColumn),
		getLayerDurationSeconds: vi.fn().mockReturnValue(durationSec),
		getLayerElapsedSeconds: vi.fn().mockReturnValue(elapsedSec),
		queryAllLayers: vi.fn(),
	}
	const instance = {
		log: vi.fn(),
		getOscApi: vi.fn().mockReturnValue(oscApi),
		getOscState: vi.fn().mockReturnValue(oscState),
		parseVariablesInString: vi.fn().mockImplementation((s: string) => Promise.resolve(s)),
		_oscApi: oscApi,
		_oscState: oscState,
	}
	return instance as any
}

// ── Column / composition transport ───────────────────────────────────────────

describe('oscTriggerColumn', () => {
	it('calls triggerColumn with the correct column number', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscTriggerColumn!.callback({ options: { column: '3' } } as any, {} as any)
		expect(mod._oscApi.triggerColumn).toHaveBeenCalledWith(3)
	})

	it('schedules a quick refresh after triggering', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscTriggerColumn!.callback({ options: { column: '1' } } as any, {} as any)
		expect(mod._oscState.scheduleQuickRefresh).toHaveBeenCalled()
	})

	it('does nothing for non-numeric input', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscTriggerColumn!.callback({ options: { column: 'abc' } } as any, {} as any)
		expect(mod._oscApi.triggerColumn).not.toHaveBeenCalled()
	})
})

describe('oscNextColumn', () => {
	it('calls compNextCol and schedules refresh', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscNextColumn!.callback({} as any, {} as any)
		expect(mod._oscApi.compNextCol).toHaveBeenCalled()
		expect(mod._oscState.scheduleQuickRefresh).toHaveBeenCalled()
	})
})

describe('oscPrevColumn', () => {
	it('calls compPrevCol and schedules refresh', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscPrevColumn!.callback({} as any, {} as any)
		expect(mod._oscApi.compPrevCol).toHaveBeenCalled()
		expect(mod._oscState.scheduleQuickRefresh).toHaveBeenCalled()
	})
})

describe('oscClearAllLayers', () => {
	it('calls clearAllLayers', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClearAllLayers!.callback({} as any, {} as any)
		expect(mod._oscApi.clearAllLayers).toHaveBeenCalled()
	})
})

describe('oscSelectColumn', () => {
	it('sends select message for column 2', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectColumn!.callback({ options: { column: '2' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/columns/2/select', { type: 'i', value: 1 })
	})

	it('does nothing for non-numeric column', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectColumn!.callback({ options: { column: 'x' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── Clip connect / disconnect ────────────────────────────────────────────────

describe('oscConnectClip', () => {
	it('calls connectClip with layer and column', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscConnectClip!.callback({ options: { layer: '2', column: '3' } } as any, {} as any)
		expect(mod._oscApi.connectClip).toHaveBeenCalledWith(2, 3)
	})

	it('schedules refresh', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscConnectClip!.callback({ options: { layer: '1', column: '1' } } as any, {} as any)
		expect(mod._oscState.scheduleQuickRefresh).toHaveBeenCalled()
	})

	it('does nothing if layer is non-numeric', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscConnectClip!.callback({ options: { layer: 'foo', column: '1' } } as any, {} as any)
		expect(mod._oscApi.connectClip).not.toHaveBeenCalled()
	})
})

describe('oscClearLayer', () => {
	it('calls clearLayer with layer number', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClearLayer!.callback({ options: { layer: '2' } } as any, {} as any)
		expect(mod._oscApi.clearLayer).toHaveBeenCalledWith(2)
	})

	it('does nothing for invalid layer', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClearLayer!.callback({ options: { layer: '' } } as any, {} as any)
		expect(mod._oscApi.clearLayer).not.toHaveBeenCalled()
	})
})

describe('oscLayerNextClip', () => {
	it('calls layerNextCol with layer number', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscLayerNextClip!.callback({ options: { layer: '1' } } as any, {} as any)
		expect(mod._oscApi.layerNextCol).toHaveBeenCalledWith(1)
	})
})

describe('oscLayerPrevClip', () => {
	it('calls layerPrevCol with layer number', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscLayerPrevClip!.callback({ options: { layer: '2' } } as any, {} as any)
		expect(mod._oscApi.layerPrevCol).toHaveBeenCalledWith(2)
	})
})

describe('oscSelectClip', () => {
	it('calls selectClip with layer and column', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectClip!.callback({ options: { layer: '1', column: '2' } } as any, {} as any)
		expect(mod._oscApi.selectClip).toHaveBeenCalledWith(1, 2)
	})
})

// ── Clip transport ────────────────────────────────────────────────────────────

describe('oscClipPauseResume', () => {
	it('sends value 2 (play) when direction is 1 (paused)', async () => {
		const mod = makeMockInstance({ direction: 1 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/direction',
			{ type: 'i', value: 2 }
		)
	})

	it('sends value 1 (pause) when direction is 2 (playing)', async () => {
		const mod = makeMockInstance({ direction: 2 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/direction',
			{ type: 'i', value: 1 }
		)
	})

	it('sends value 0 (backward) for state=backward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'backward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/direction',
			{ type: 'i', value: 0 }
		)
	})

	it('sends value 1 (pause) for state=pause', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '2', state: 'pause' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/2/direction',
			{ type: 'i', value: 1 }
		)
	})

	it('sends value 2 (forward) for state=forward', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscClipPauseResume!.callback({ options: { layer: '1', state: 'forward' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/direction',
			{ type: 'i', value: 2 }
		)
	})
})

describe('oscClipSpeed', () => {
	it('sends speed OSC message for active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipSpeed!.callback({ options: { layer: '1', speed: '100' } } as any, {} as any)
		// getSpeedValue(100) ≈ 4.0 (Resolume internal scale)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position/behaviour/speed',
			expect.objectContaining({ type: 'f' })
		)
	})

	it('does nothing when no active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipSpeed!.callback({ options: { layer: '1', speed: '100' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

describe('oscClipOpacity', () => {
	it('sends opacity to active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 2 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipOpacity!.callback({ options: { layer: '1', value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/2/video/opacity',
			{ type: 'f', value: 0.5 }
		)
	})

	it('does nothing when no active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipOpacity!.callback({ options: { layer: '1', value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

describe('oscClipVolume', () => {
	it('sends volume to active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 2 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipVolume!.callback({ options: { layer: '1', value: '0.75' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/2/audio/volume',
			{ type: 'f', value: 0.75 }
		)
	})
})

describe('oscClipGoToPosition', () => {
	it('sends normalized position to active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 1 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToPosition!.callback({ options: { layer: '1', position: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/1/transport/position',
			{ type: 'f', value: 0.5 }
		)
	})

	it('does nothing when no active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToPosition!.callback({ options: { layer: '1', position: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

describe('oscClipGoToTime', () => {
	it('sends normalized position when duration is known', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToTime!.callback({ options: { layer: '1', time: '30' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 0.5 }
		)
	})

	it('logs a warning and does not send when duration is 0', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToTime!.callback({ options: { layer: '1', time: '10' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
		expect(mod.log).toHaveBeenCalledWith('warn', expect.stringContaining('duration'))
	})

	it('clamps to 0 for negative time', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToTime!.callback({ options: { layer: '1', time: '-5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 0 }
		)
	})

	it('clamps to 1 for time beyond duration', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToTime!.callback({ options: { layer: '1', time: '100' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 1 }
		)
	})
})

describe('oscClipJogTime', () => {
	it('clamps normalized value to 1.0 when jogging past the end', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60, elapsedSec: 55 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipJogTime!.callback({ options: { layer: '1', time: '10' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 1 }
		)
	})

	it('clamps normalized value to 0.0 when jogging before the start', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60, elapsedSec: 5 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipJogTime!.callback({ options: { layer: '1', time: '-10' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 0 }
		)
	})

	it('sends correct mid-clip jog', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60, elapsedSec: 20 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipJogTime!.callback({ options: { layer: '1', time: '10' } } as any, {} as any)
		// new time = 30, normalized = 0.5
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 0.5 }
		)
	})

	it('logs warning when no duration data', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipJogTime!.callback({ options: { layer: '1', time: '5' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
		expect(mod.log).toHaveBeenCalledWith('warn', expect.any(String))
	})
})

describe('oscClipGoToSecondsFromEnd', () => {
	it('clamps to 0.0 when target position would be negative', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToSecondsFromEnd!.callback({ options: { layer: '1', seconds: '200' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: 0 }
		)
	})

	it('sends correct normalized position for valid seconds-from-end', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 60 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToSecondsFromEnd!.callback({ options: { layer: '1', seconds: '10' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/3/transport/position',
			{ type: 'f', value: expect.closeTo(50 / 60, 5) }
		)
	})

	it('logs warning when no duration data', async () => {
		const mod = makeMockInstance({ activeColumn: 3, durationSec: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipGoToSecondsFromEnd!.callback({ options: { layer: '1', seconds: '10' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
		expect(mod.log).toHaveBeenCalledWith('warn', expect.any(String))
	})
})

describe('oscClipRestartMedia', () => {
	it('sends position 0 to active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 2 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipRestartMedia!.callback({ options: { layer: '1' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/clips/2/transport/position',
			{ type: 'f', value: 0 }
		)
	})

	it('does nothing when no active clip', async () => {
		const mod = makeMockInstance({ activeColumn: 0 })
		const actions = getOscTransportActions(mod)
		await actions.oscClipRestartMedia!.callback({ options: { layer: '1' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── Composition / master controls ────────────────────────────────────────────

describe('oscSetMasterOpacity', () => {
	it('sends opacity to composition video opacity path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetMasterOpacity!.callback({ options: { value: '0.8' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/video/opacity', { type: 'f', value: 0.8 })
	})
})

describe('oscSetMasterVolume', () => {
	it('sends volume to composition audio volume path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetMasterVolume!.callback({ options: { value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/audio/volume', { type: 'f', value: 0.5 })
	})
})

describe('oscSetCompositionMaster', () => {
	it('sends master value to composition master path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetCompositionMaster!.callback({ options: { value: '1.0' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/master', { type: 'f', value: 1.0 })
	})
})

describe('oscSetCompositionSpeed', () => {
	it('sends speed to composition speed path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetCompositionSpeed!.callback({ options: { value: '0.75' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith('/composition/speed', { type: 'f', value: 0.75 })
	})
})

describe('oscSetCompositionTempo', () => {
	it('sends tempo to tempocontroller path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetCompositionTempo!.callback({ options: { tempo: '140' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/tempocontroller/tempo',
			{ type: 'f', value: 140 }
		)
	})

	it('does nothing for non-numeric tempo', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetCompositionTempo!.callback({ options: { tempo: 'fast' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

describe('oscTempoTap', () => {
	it('calls tempoTap', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscTempoTap!.callback({} as any, {} as any)
		expect(mod._oscApi.tempoTap).toHaveBeenCalled()
	})
})

describe('oscTempoResync', () => {
	it('calls tempoResync', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscTempoResync!.callback({} as any, {} as any)
		expect(mod._oscApi.tempoResync).toHaveBeenCalled()
	})
})

// ── Layer controls ────────────────────────────────────────────────────────────

describe('oscSetLayerOpacity', () => {
	it('sends opacity to layer video opacity path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetLayerOpacity!.callback({ options: { layer: '2', value: '0.6' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/2/video/opacity',
			{ type: 'f', value: 0.6 }
		)
	})
})

describe('oscSetLayerVolume', () => {
	it('sends volume to layer audio volume path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetLayerVolume!.callback({ options: { layer: '1', value: '0.3' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/audio/volume',
			{ type: 'f', value: 0.3 }
		)
	})
})

describe('oscSetLayerMaster', () => {
	it('sends master to layer master path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetLayerMaster!.callback({ options: { layer: '3', value: '0.9' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/3/master',
			{ type: 'f', value: 0.9 }
		)
	})
})

describe('oscBypassLayer', () => {
	it('sends bypassed=1 for bypass=on', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscBypassLayer!.callback({ options: { layer: '1', bypass: 'on' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/bypassed',
			{ type: 'i', value: 1 }
		)
	})

	it('sends bypassed=0 for bypass=off', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscBypassLayer!.callback({ options: { layer: '1', bypass: 'off' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/bypassed',
			{ type: 'i', value: 0 }
		)
	})

	it('sends toggle "!" for bypass=toggle', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscBypassLayer!.callback({ options: { layer: '2', bypass: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/2/bypassed',
			[{ type: 's', value: '!' }]
		)
	})
})

describe('oscSoloLayer', () => {
	it('sends solo=1 for solo=on', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSoloLayer!.callback({ options: { layer: '1', solo: 'on' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/solo',
			{ type: 'i', value: 1 }
		)
	})

	it('sends solo=0 for solo=off', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSoloLayer!.callback({ options: { layer: '1', solo: 'off' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/solo',
			{ type: 'i', value: 0 }
		)
	})

	it('sends toggle "!" for solo=toggle', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSoloLayer!.callback({ options: { layer: '3', solo: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/3/solo',
			[{ type: 's', value: '!' }]
		)
	})
})

describe('oscSelectLayer', () => {
	it('sends select=1 to layer', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectLayer!.callback({ options: { layer: '2' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/2/select',
			{ type: 'i', value: 1 }
		)
	})
})

describe('oscLayerTransitionDuration', () => {
	it('sends transition duration to layer', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscLayerTransitionDuration!.callback({ options: { layer: '1', value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/transition/duration',
			{ type: 'f', value: 0.5 }
		)
	})
})

describe('oscSetLayerSpeed', () => {
	it('sends speed to layer speed path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSetLayerSpeed!.callback({ options: { layer: '1', value: '0.75' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/layers/1/speed',
			{ type: 'f', value: 0.75 }
		)
	})
})

// ── Deck navigation ───────────────────────────────────────────────────────────

describe('oscNextDeck', () => {
	it('calls compNextDeck', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscNextDeck!.callback({} as any, {} as any)
		expect(mod._oscApi.compNextDeck).toHaveBeenCalled()
	})
})

describe('oscPrevDeck', () => {
	it('calls compPrevDeck', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscPrevDeck!.callback({} as any, {} as any)
		expect(mod._oscApi.compPrevDeck).toHaveBeenCalled()
	})
})

describe('oscSelectDeck', () => {
	it('sends select=1 to deck path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectDeck!.callback({ options: { deck: '2' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/decks/2/select',
			{ type: 'i', value: 1 }
		)
	})

	it('does nothing for non-numeric deck', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectDeck!.callback({ options: { deck: 'main' } } as any, {} as any)
		expect(mod._oscApi.send).not.toHaveBeenCalled()
	})
})

// ── Group controls ────────────────────────────────────────────────────────────

describe('oscGroupTriggerColumn', () => {
	it('calls triggerlayerGroupColumn with group and column', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupTriggerColumn!.callback({ options: { group: '1', column: '3' } } as any, {} as any)
		expect(mod._oscApi.triggerlayerGroupColumn).toHaveBeenCalledWith(1, 3)
	})

	it('does nothing for non-numeric group', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupTriggerColumn!.callback({ options: { group: 'x', column: '1' } } as any, {} as any)
		expect(mod._oscApi.triggerlayerGroupColumn).not.toHaveBeenCalled()
	})
})

describe('oscGroupNextColumn', () => {
	it('calls layerGroupNextCol with group and lastColumn', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupNextColumn!.callback({ options: { group: '1', lastColumn: '5' } } as any, {} as any)
		expect(mod._oscApi.layerGroupNextCol).toHaveBeenCalledWith(1, 5)
	})
})

describe('oscGroupPrevColumn', () => {
	it('calls groupPrevCol with group and lastColumn', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupPrevColumn!.callback({ options: { group: '1', lastColumn: '5' } } as any, {} as any)
		expect(mod._oscApi.groupPrevCol).toHaveBeenCalledWith(1, 5)
	})
})

describe('oscGroupClear', () => {
	it('calls clearLayerGroup with group number', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupClear!.callback({ options: { group: '2' } } as any, {} as any)
		expect(mod._oscApi.clearLayerGroup).toHaveBeenCalledWith(2)
	})
})

describe('oscGroupBypass', () => {
	it('calls bypassLayerGroup with value 1 for bypass=on', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupBypass!.callback({ options: { group: '1', bypass: 'on' } } as any, {} as any)
		expect(mod._oscApi.bypassLayerGroup).toHaveBeenCalledWith(1, expect.objectContaining({ value: 1 }))
	})

	it('calls bypassLayerGroup with value 0 for bypass=off', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupBypass!.callback({ options: { group: '1', bypass: 'off' } } as any, {} as any)
		expect(mod._oscApi.bypassLayerGroup).toHaveBeenCalledWith(1, expect.objectContaining({ value: 0 }))
	})

	it('sends toggle "!" for bypass=toggle', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupBypass!.callback({ options: { group: '2', bypass: 'toggle' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/2/bypassed',
			[{ type: 's', value: '!' }]
		)
	})
})

describe('oscGroupSetMaster', () => {
	it('sends master value to group master path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSetMaster!.callback({ options: { group: '1', value: '0.8' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/master',
			{ type: 'f', value: 0.8 }
		)
	})
})

describe('oscGroupSetOpacity', () => {
	it('sends opacity to group video opacity path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSetOpacity!.callback({ options: { group: '1', value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/video/opacity',
			{ type: 'f', value: 0.5 }
		)
	})
})

describe('oscGroupSetVolume', () => {
	it('sends volume to group audio volume path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSetVolume!.callback({ options: { group: '2', value: '1.0' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/2/audio/volume',
			{ type: 'f', value: 1.0 }
		)
	})
})

describe('oscGroupSetSpeed', () => {
	it('sends speed to group speed path', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSetSpeed!.callback({ options: { group: '1', value: '0.5' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/speed',
			{ type: 'f', value: 0.5 }
		)
	})
})

describe('oscGroupSolo', () => {
	it('sends solo=1 for solo=on', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSolo!.callback({ options: { group: '1', solo: 'on' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/solo',
			{ type: 'i', value: 1 }
		)
	})

	it('sends solo=0 for solo=off', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscGroupSolo!.callback({ options: { group: '2', solo: 'off' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/2/solo',
			{ type: 'i', value: 0 }
		)
	})
})

describe('oscSelectGroup', () => {
	it('sends select=1 to group', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectGroup!.callback({ options: { group: '1' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/select',
			{ type: 'i', value: 1 }
		)
	})
})

describe('oscSelectGroupColumn', () => {
	it('sends select=1 to group column', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscSelectGroupColumn!.callback({ options: { group: '1', column: '3' } } as any, {} as any)
		expect(mod._oscApi.send).toHaveBeenCalledWith(
			'/composition/groups/1/columns/3/select',
			{ type: 'i', value: 1 }
		)
	})
})

// ── Custom OSC ────────────────────────────────────────────────────────────────

describe('oscCustomCommand', () => {
	it('calls customOsc with the given path and type', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscCustomCommand!.callback({
			options: { customPath: '/composition/tempo', oscType: 'f', customValue: '120', relativeType: 'n' },
		} as any, {} as any)
		expect(mod._oscApi.customOsc).toHaveBeenCalledWith('/composition/tempo', 'f', '120', 'n')
	})

	it('calls customOsc with type=n (trigger, no value)', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscCustomCommand!.callback({
			options: { customPath: '/composition/layers/1/select', oscType: 'n', customValue: '', relativeType: 'n' },
		} as any, {} as any)
		expect(mod._oscApi.customOsc).toHaveBeenCalledWith(
			'/composition/layers/1/select', 'n', '', 'n'
		)
	})
})

// ── Re-query ──────────────────────────────────────────────────────────────────

describe('oscReQueryClip', () => {
	it('calls queryAllLayers on oscState', async () => {
		const mod = makeMockInstance()
		const actions = getOscTransportActions(mod)
		await actions.oscReQueryClip!.callback({} as any, {} as any)
		expect(mod._oscState.queryAllLayers).toHaveBeenCalled()
	})
})
