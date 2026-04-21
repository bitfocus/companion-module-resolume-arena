import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bypassLayer } from '../../src/actions/layer/actions/bypass-layer'
import { clearLayer } from '../../src/actions/layer/actions/clear-layer'
import { soloLayer } from '../../src/actions/layer/actions/solo-layer'
import { selectLayer } from '../../src/actions/layer/actions/select-layer'
import { layerMasterChange } from '../../src/actions/layer/actions/layer-master-change'
import { layerOpacityChange } from '../../src/actions/layer/actions/layer-opacity-change'
import { layerVolumeChange } from '../../src/actions/layer/actions/layer-volume-change'
import { layerTransitionDurationChange } from '../../src/actions/layer/actions/layer-transition-duration-change'
import { layerNextCol } from '../../src/actions/layer/actions/layer-next-col'
import { layerPrevCol } from '../../src/actions/layer/actions/layer-prev-col'
import { parameterStates, compositionState } from '../../src/state'

function makeWsApi() {
	return { setPath: vi.fn(), setParam: vi.fn(), subscribeParam: vi.fn(), subscribePath: vi.fn(), triggerPath: vi.fn() }
}

function makeOscApi() {
	return { bypassLayer: vi.fn(), clearLayer: vi.fn(), layerNextCol: vi.fn(), layerPrevCol: vi.fn() }
}

function makeInstance(parseResults: string[] | string = '1') {
	const results = Array.isArray(parseResults) ? [...parseResults] : null
	let callIndex = 0
	return {
		log: vi.fn(),
		checkFeedbacks: vi.fn(),
		parseVariablesInString: vi.fn().mockImplementation(() => {
			if (results) {
				return Promise.resolve(results[callIndex++] ?? results[results.length - 1])
			}
			return Promise.resolve(parseResults as string)
		}),
		resolveInt: vi.fn().mockImplementation((s: string) => { const n = parseInt(s, 10); return Promise.resolve(isNaN(n) ? undefined : n) }),
		resolveNumber: vi.fn().mockImplementation((s: string) => { const n = parseFloat(s); return Promise.resolve(isNaN(n) ? undefined : n) }),
		restApi: null as any,
	} as any
}

function makeRestLayer(overrides: Record<string, any> = {}) {
	return {
		master: { value: 0.5, id: 100 },
		video: { opacity: { value: 0.8, id: 101 } },
		audio: { volume: { value: 0.9, id: 102 } },
		transition: { duration: { value: 2.0, id: 103 } },
		...overrides,
	}
}

beforeEach(() => {
	parameterStates.set({})
	compositionState.set(undefined)
})

// ── bypassLayer ────────────────────────────────────────────────────────────────

describe('bypassLayer — REST path', () => {
	it('bypass=on sets bypassed to true', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'on' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/bypassed', true)
	})

	it('bypass=off sets bypassed to false', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'off' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/bypassed', false)
	})

	it('bypass=toggle flips from true to false', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/layers/1/bypassed': { value: true } } as any)
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'toggle' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/bypassed', false)
	})
})

describe('bypassLayer — optimistic state update and checkFeedbacks', () => {
	it('bypass=on updates parameterStates immediately and calls checkFeedbacks', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'on' } })
		expect(parameterStates.get()['/composition/layers/1/bypassed']?.value).toBe(true)
		expect(instance.checkFeedbacks).toHaveBeenCalledWith('layerBypassed')
	})

	it('bypass=off updates parameterStates immediately to false', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/layers/1/bypassed': { value: true } } as any)
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'off' } })
		expect(parameterStates.get()['/composition/layers/1/bypassed']?.value).toBe(false)
		expect(instance.checkFeedbacks).toHaveBeenCalledWith('layerBypassed')
	})

	it('bypass=toggle updates parameterStates to flipped value immediately', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/layers/1/bypassed': { value: false } } as any)
		const instance = makeInstance('1')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'toggle' } })
		expect(parameterStates.get()['/composition/layers/1/bypassed']?.value).toBe(true)
		expect(instance.checkFeedbacks).toHaveBeenCalledWith('layerBypassed')
	})

	it('single subscriber: feedback re-evaluates even when WS subscription is temporarily dropped', async () => {
		// Simulates the single-rotary-encoder scenario: only one feedback subscriber,
		// bypass is toggled, parameterStates is updated optimistically, checkFeedbacks fires.
		const ws = makeWsApi()
		parameterStates.set({ '/composition/layers/2/bypassed': { value: true } } as any)
		const instance = makeInstance('2')
		const action = bypassLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '2', bypass: 'toggle' } })
		// State should reflect the new bypassed=false immediately, without needing a WS response
		expect(parameterStates.get()['/composition/layers/2/bypassed']?.value).toBe(false)
		expect(instance.checkFeedbacks).toHaveBeenCalledWith('layerBypassed')
	})

	it('does not call checkFeedbacks when restApi is null (OSC path)', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('1')
		const action = bypassLayer(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'on' } })
		expect(instance.checkFeedbacks).not.toHaveBeenCalled()
	})
})

describe('bypassLayer — OSC path', () => {
	it('bypass=on calls oscApi.bypassLayer with value 1', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = bypassLayer(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2', bypass: 'on' } })
		expect(osc.bypassLayer).toHaveBeenCalledWith(2, expect.objectContaining({ value: 1 }))
	})

	it('bypass=toggle via OSC logs warning and does not call bypassLayer', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('1')
		const action = bypassLayer(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'toggle' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
		expect(osc.bypassLayer).not.toHaveBeenCalled()
	})
})

// ── clearLayer ─────────────────────────────────────────────────────────────────

describe('clearLayer — REST path', () => {
	it('triggers clear path via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('3')
		const action = clearLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '3' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/3/clear')
	})
})

describe('clearLayer — OSC path', () => {
	it('calls oscApi.clearLayer when no REST api', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = clearLayer(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2' } })
		expect(osc.clearLayer).toHaveBeenCalledWith(2)
	})
})

// ── soloLayer ──────────────────────────────────────────────────────────────────

describe('soloLayer', () => {
	it('solo=on sets solo to true', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = soloLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', solo: 'on' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/solo', true)
	})

	it('solo=off sets solo to false', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = soloLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', solo: 'off' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/solo', false)
	})

	it('solo=toggle flips current state', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/layers/2/solo': { value: true } } as any)
		const instance = makeInstance('2')
		const action = soloLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '2', solo: 'toggle' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/2/solo', false)
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const action = soloLayer(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', solo: 'on' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})
})

// ── selectLayer ────────────────────────────────────────────────────────────────

describe('selectLayer', () => {
	it('triggers select path via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('2')
		const action = selectLayer(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '2' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/2/select')
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = selectLayer(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

// ── layerNextCol / layerPrevCol ────────────────────────────────────────────────

describe('layerNextCol', () => {
	it('calls oscApi.layerNextCol with parsed layer number', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = layerNextCol(() => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2' } })
		expect(osc.layerNextCol).toHaveBeenCalledWith(2)
	})
})

describe('layerPrevCol', () => {
	it('calls oscApi.layerPrevCol with parsed layer number', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('3')
		const action = layerPrevCol(() => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '3' } })
		expect(osc.layerPrevCol).toHaveBeenCalledWith(3)
	})
})

// ── layerMasterChange ─────────────────────────────────────────────────────────

describe('layerMasterChange', () => {
	it('set — calls setPath with inputValue/100', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '50'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerMasterChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/master', 0.5)
	})

	it('add — adds inputValue/100 to current master', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '10'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer({ master: { value: 0.5, id: 100 } })) } }
		const action = layerMasterChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'add', value: '10' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/master', 0.6)
	})

	it('subtract — subtracts inputValue/100 from current master', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '20'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer({ master: { value: 0.5, id: 100 } })) } }
		const action = layerMasterChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'subtract', value: '20' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layers/1/master', 0.3)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = layerMasterChange(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '100' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})
})

// ── layerOpacityChange ────────────────────────────────────────────────────────

describe('layerOpacityChange', () => {
	function makeLayerUtils(paramId = 101) {
		return {
			getLayerFromCompositionState: vi.fn().mockReturnValue({
				video: { opacity: { id: paramId } },
			}),
		}
	}

	it('set — calls subscribeParam + setParam with new value', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '80'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerOpacityChange(() => ({} as any), () => ws as any, () => null, () => makeLayerUtils() as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '80' } })
		expect(ws.subscribeParam).toHaveBeenCalledWith(101)
		expect(ws.setParam).toHaveBeenCalledWith('101', 0.8)
	})

	it('add — adds inputValue/100 to current opacity', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '10'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerOpacityChange(() => ({} as any), () => ws as any, () => null, () => makeLayerUtils() as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'add', value: '10' } })
		// current=0.8 + 0.1 = 0.9
		expect(ws.setParam).toHaveBeenCalledWith('101', expect.closeTo(0.9, 5))
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = layerOpacityChange(() => null, () => ws as any, () => null, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '100' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})

	it('does not call subscribeParam or setParam when layer has no opacity id (#140)', async () => {
		const ws = makeWsApi()
		const layerUtils = { getLayerFromCompositionState: vi.fn().mockReturnValue(undefined) }
		const instance = makeInstance(['1', '50'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerOpacityChange(() => ({} as any), () => ws as any, () => null, () => layerUtils as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.subscribeParam).not.toHaveBeenCalled()
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})

// ── layerVolumeChange ─────────────────────────────────────────────────────────

describe('layerVolumeChange', () => {
	function makeLayerUtils(paramId = 102) {
		return {
			getLayerFromCompositionState: vi.fn().mockReturnValue({
				audio: { volume: { id: paramId } },
			}),
		}
	}

	it('set — calls setParam with raw value (not /100)', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '0.5'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerVolumeChange(() => ({} as any), () => ws as any, () => null, () => makeLayerUtils() as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '0.5' } })
		expect(ws.setParam).toHaveBeenCalledWith('102', 0.5)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = layerVolumeChange(() => null, () => ws as any, () => null, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '1.0' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})

	it('does not call subscribeParam or setParam when layer has no volume id (#140)', async () => {
		const ws = makeWsApi()
		const layerUtils = { getLayerFromCompositionState: vi.fn().mockReturnValue(undefined) }
		const instance = makeInstance(['1', '-6'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerVolumeChange(() => ({} as any), () => ws as any, () => null, () => layerUtils as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '-6' } })
		expect(ws.subscribeParam).not.toHaveBeenCalled()
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})

// ── layerTransitionDurationChange ─────────────────────────────────────────────

describe('layerTransitionDurationChange', () => {
	function makeLayerUtils(paramId = 103) {
		return {
			getLayerFromCompositionState: vi.fn().mockReturnValue({
				transition: { duration: { id: paramId } },
			}),
		}
	}

	it('set — calls setParam with raw value', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '1.5'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerTransitionDurationChange(() => ({} as any), () => ws as any, () => null, () => makeLayerUtils() as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '1.5' } })
		expect(ws.setParam).toHaveBeenCalledWith('103', 1.5)
	})

	it('add — adds to current transition duration', async () => {
		const ws = makeWsApi()
		const instance = makeInstance(['1', '0.5'])
		instance.restApi = { Layers: { getSettings: vi.fn().mockResolvedValue(makeRestLayer()) } }
		const action = layerTransitionDurationChange(() => ({} as any), () => ws as any, () => null, () => makeLayerUtils() as any, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'add', value: '0.5' } })
		// current=2.0 + 0.5 = 2.5
		expect(ws.setParam).toHaveBeenCalledWith('103', 2.5)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const action = layerTransitionDurationChange(() => null, () => ws as any, () => null, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '1.0' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})
})
