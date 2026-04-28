/**
 * Tests for miscellaneous simple action callbacks:
 * - compNextCol / compPrevCol
 * - clearAllLayers
 * - tempoTap / tempoResync
 * - layerGroupNextCol / selectLayerGroup
 * - layerGroupSpeedChange / layerGroupVolumeChange
 * - selectNextDeck / selectPreviousDeck
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compNextCol } from '../../src/actions/composition/actions/comp-next-col'
import { compPrevCol } from '../../src/actions/composition/actions/comp-prev-col'
import { clearAllLayers } from '../../src/actions/composition/actions/clear-all-layers'
import { tempoTap } from '../../src/actions/composition/actions/tempo-tap'
import { tempoResync } from '../../src/actions/composition/actions/tempo-resync'
import { layerGroupNextCol } from '../../src/actions/layer-group/actions/layer-group-next-col'
import { layerGroupPrevCol } from '../../src/actions/layer-group/actions/layer-group-prev-col'
import { selectLayerGroup } from '../../src/actions/layer-group/actions/select-layer-group'
import { layerGroupSpeedChange } from '../../src/actions/layer-group/actions/layer-group-speed-change'
import { layerGroupVolumeChange } from '../../src/actions/layer-group/actions/layer-group-volume-change'
import { selectNextDeck } from '../../src/actions/deck/actions/select-next-deck'
import { selectPreviousDeck } from '../../src/actions/deck/actions/select-previous-deck'
import { compositionState, parameterStates } from '../../src/state'

function makeWsApi() {
	return { triggerPath: vi.fn(), triggerParam: vi.fn(), setPath: vi.fn(), setParam: vi.fn() }
}

function makeOscApi() {
	return {
		compNextCol: vi.fn(),
		compPrevCol: vi.fn(),
		clearAllLayers: vi.fn(),
		tempoTap: vi.fn(),
		layerGroupNextCol: vi.fn(),
		groupPrevCol: vi.fn(),
		compNextDeck: vi.fn(),
		compPrevDeck: vi.fn(),
	}
}

function makeInstance(...results: string[]) {
	let idx = 0
	return {
		log: vi.fn(),
		parseVariablesInString: vi.fn().mockImplementation(() => Promise.resolve(results[idx++] ?? '1')),
	} as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── compNextCol / compPrevCol ──────────────────────────────────────────────────

describe('compNextCol', () => {
	it('calls oscApi.compNextCol', async () => {
		const osc = makeOscApi()
		const action = compNextCol(() => null, () => osc as any)
		await (action.callback as any)({})
		expect(osc.compNextCol).toHaveBeenCalled()
	})
})

describe('compPrevCol', () => {
	it('calls oscApi.compPrevCol', async () => {
		const osc = makeOscApi()
		const action = compPrevCol(() => null, () => osc as any)
		await (action.callback as any)({})
		expect(osc.compPrevCol).toHaveBeenCalled()
	})
})

// ── clearAllLayers ─────────────────────────────────────────────────────────────

describe('clearAllLayers — REST path', () => {
	it('triggers clear for each layer in composition', async () => {
		const ws = makeWsApi()
		compositionState.set({ layers: [{}, {}, {}] } as any)
		const action = clearAllLayers(() => ({} as any), () => ws as any, () => null)
		await (action.callback as any)({})
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/1/clear')
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/2/clear')
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/3/clear')
	})

	it('does nothing when no layers in composition', async () => {
		const ws = makeWsApi()
		compositionState.set({ layers: undefined } as any)
		const action = clearAllLayers(() => ({} as any), () => ws as any, () => null)
		await (action.callback as any)({})
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

describe('clearAllLayers — OSC path', () => {
	it('calls oscApi.clearAllLayers when no REST api', async () => {
		const osc = makeOscApi()
		const action = clearAllLayers(() => null, () => null, () => osc as any)
		await (action.callback as any)({})
		expect(osc.clearAllLayers).toHaveBeenCalled()
	})
})

// ── tempoTap ───────────────────────────────────────────────────────────────────

describe('tempoTap — REST path', () => {
	it('triggers tempoTap param true then false', async () => {
		const ws = makeWsApi()
		compositionState.set({ tempocontroller: { tempotap: { id: 42 } } } as any)
		const action = tempoTap(() => ({} as any), () => ws as any, () => null)
		await (action.callback as any)({})
		expect(ws.triggerParam).toHaveBeenCalledWith('42', true)
		expect(ws.triggerParam).toHaveBeenCalledWith('42', false)
	})
})

describe('tempoTap — OSC path', () => {
	it('calls oscApi.tempoTap', async () => {
		const osc = makeOscApi()
		const action = tempoTap(() => null, () => null, () => osc as any)
		await (action.callback as any)({})
		expect(osc.tempoTap).toHaveBeenCalled()
	})
})

// ── tempoResync ────────────────────────────────────────────────────────────────

describe('tempoResync — OSC path', () => {
	it('calls oscApi.tempoTap (resync delegates to tempoTap in OSC mode)', async () => {
		const osc = makeOscApi()
		const action = tempoResync(() => null, () => null, () => osc as any)
		await (action.callback as any)({})
		expect(osc.tempoTap).toHaveBeenCalled()
	})
})

// ── layerGroupNextCol / layerGroupPrevCol ──────────────────────────────────────

describe('layerGroupNextCol', () => {
	it('calls oscApi.layerGroupNextCol with layer group', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = layerGroupNextCol(() => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2', lastColumn: '4' } })
		expect(osc.layerGroupNextCol).toHaveBeenCalledWith(2, '4')
	})
})

describe('layerGroupPrevCol', () => {
	it('calls oscApi.groupPrevCol with layer group and last column', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('1', '3')
		const action = layerGroupPrevCol(() => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '1', lastColumn: '3' } })
		expect(osc.groupPrevCol).toHaveBeenCalledWith(1, 3)
	})
})

// ── selectLayerGroup ───────────────────────────────────────────────────────────

describe('selectLayerGroup', () => {
	it('triggers select path via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('2')
		const action = selectLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '2' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/2/select')
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = selectLayerGroup(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

// ── layerGroupSpeedChange ──────────────────────────────────────────────────────

describe('layerGroupSpeedChange', () => {
	it('set — calls setPath with inputValue/100', async () => {
		const ws = makeWsApi()
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('50'),
		} as any
		const action = layerGroupSpeedChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/speed', 0.5)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = layerGroupSpeedChange(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})
})

// ── layerGroupVolumeChange ─────────────────────────────────────────────────────

describe('layerGroupVolumeChange', () => {
	it('set — calls setParam with raw value', async () => {
		const ws = makeWsApi()
		const layerGroupUtils = {
			getLayerGroupFromCompositionState: vi.fn().mockReturnValue({ audio: { volume: { id: 55 } } }),
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('-12'),
		} as any
		const action = layerGroupVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => layerGroupUtils as any,
			instance
		)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '-12' } })
		expect(ws.setParam).toHaveBeenCalledWith('55', -12)
	})

	it('add — adds to current value', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/groups/1/audio/volume': { value: -18 } } as any)
		const layerGroupUtils = {
			getLayerGroupFromCompositionState: vi.fn().mockReturnValue({ audio: { volume: { id: 55 } } }),
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('6'),
		} as any
		const action = layerGroupVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => layerGroupUtils as any,
			instance
		)
		await (action.callback as any)({ options: { layer: '1', action: 'add', value: '6' } })
		expect(ws.setParam).toHaveBeenCalledWith('55', -12)
	})
})

// ── selectNextDeck / selectPreviousDeck ────────────────────────────────────────

describe('selectNextDeck — REST path', () => {
	it('triggers next deck select path', async () => {
		const ws = makeWsApi()
		const deckUtils = { calculateNextDeck: vi.fn().mockReturnValue(3) }
		const action = selectNextDeck(() => ({} as any), () => ws as any, () => null, () => deckUtils as any)
		await (action.callback as any)({})
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/decks/3/select')
	})
})

describe('selectNextDeck — OSC path', () => {
	it('calls oscApi.compNextDeck', async () => {
		const osc = makeOscApi()
		const action = selectNextDeck(() => null, () => null, () => osc as any, () => null)
		await (action.callback as any)({})
		expect(osc.compNextDeck).toHaveBeenCalled()
	})
})

describe('selectPreviousDeck — REST path', () => {
	it('triggers prev deck select path', async () => {
		const ws = makeWsApi()
		const deckUtils = { calculatePreviousDeck: vi.fn().mockReturnValue(1) }
		const action = selectPreviousDeck(() => ({} as any), () => ws as any, () => null, () => deckUtils as any)
		await (action.callback as any)({})
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/decks/1/select')
	})
})

describe('selectPreviousDeck — OSC path', () => {
	it('calls oscApi.compPrevDeck', async () => {
		const osc = makeOscApi()
		const action = selectPreviousDeck(() => null, () => null, () => osc as any, () => null)
		await (action.callback as any)({})
		expect(osc.compPrevDeck).toHaveBeenCalled()
	})
})
