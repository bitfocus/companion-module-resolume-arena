import { describe, it, expect, vi, beforeEach } from 'vitest'
import { connectLayerGroupColumn } from '../../src/actions/layer-group/actions/connect-layer-group-column'
import { selectLayerGroupColumn } from '../../src/actions/layer-group/actions/select-layer-group-column'
import { clipSpeedChange } from '../../src/actions/clip/actions/clip-speed-change'
import { clipVolumeChange } from '../../src/actions/clip/actions/clip-volume-change'
import { clipOpacityChange } from '../../src/actions/clip/actions/clip-opacity-change'
import { compositionState, parameterStates } from '../../src/state'

function makeWsApi() {
	return { triggerPath: vi.fn(), setPath: vi.fn(), setParam: vi.fn(), subscribeParam: vi.fn() }
}

function makeOscApi() {
	return { customOsc: vi.fn() }
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

// ── connectLayerGroupColumn ────────────────────────────────────────────────────

describe('connectLayerGroupColumn', () => {
	it('action=set triggers column connect path (false then true)', async () => {
		const ws = makeWsApi()
		const lgu = { calculateNextConnectedLayerGroupColumn: vi.fn(), calculatePreviousConnectedLayerGroupColumn: vi.fn() }
		const instance = makeInstance('1', '3')
		const action = connectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'set', value: '3' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/3/connect', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/3/connect', true)
	})

	it('action=add calls calculateNextConnectedLayerGroupColumn', async () => {
		const ws = makeWsApi()
		const lgu = {
			calculateNextConnectedLayerGroupColumn: vi.fn().mockReturnValue(4),
			calculatePreviousConnectedLayerGroupColumn: vi.fn(),
		}
		const instance = makeInstance('1')
		const action = connectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'add', value: '1' } })
		expect(lgu.calculateNextConnectedLayerGroupColumn).toHaveBeenCalledWith(1, 1)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/4/connect', true)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const lgu = { calculateNextConnectedLayerGroupColumn: vi.fn() }
		const action = connectLayerGroupColumn(
			() => null,
			() => ws as any,
			() => null,
			() => lgu as any,
			makeInstance()
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'set', value: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})

	it('does not call triggerPath when calculateNext returns undefined (uninitialized state, #143)', async () => {
		const ws = makeWsApi()
		const lgu = {
			calculateNextConnectedLayerGroupColumn: vi.fn().mockReturnValue(undefined),
			calculatePreviousConnectedLayerGroupColumn: vi.fn(),
		}
		const instance = makeInstance('1', '1')
		const action = connectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'add', value: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})

	it('options.value is resolved through parseVariablesInString (#143)', async () => {
		const ws = makeWsApi()
		const lgu = { calculateNextConnectedLayerGroupColumn: vi.fn(), calculatePreviousConnectedLayerGroupColumn: vi.fn() }
		const instance = makeInstance('1', '5')
		const action = connectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'set', value: '$(var:foo)' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/5/connect', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/5/connect', true)
	})
})

// ── selectLayerGroupColumn ─────────────────────────────────────────────────────

describe('selectLayerGroupColumn', () => {
	it('action=set triggers select path (false then true)', async () => {
		const ws = makeWsApi()
		const lgu = { calculateNextSelectedLayerGroupColumn: vi.fn(), calculatePreviousSelectedLayerGroupColumn: vi.fn() }
		const instance = makeInstance('2', '2')
		const action = selectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '2', action: 'set', value: '2' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/2/columns/2/select', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/2/columns/2/select', true)
	})

	it('action=subtract calls calculatePreviousSelectedLayerGroupColumn', async () => {
		const ws = makeWsApi()
		const lgu = {
			calculateNextSelectedLayerGroupColumn: vi.fn(),
			calculatePreviousSelectedLayerGroupColumn: vi.fn().mockReturnValue(2),
		}
		const instance = makeInstance('1')
		const action = selectLayerGroupColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => lgu as any,
			instance
		)
		await (action.callback as any)({ options: { layerGroup: '1', action: 'subtract', value: '1' } })
		expect(lgu.calculatePreviousSelectedLayerGroupColumn).toHaveBeenCalledWith(1, 1)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layergroups/1/columns/2/select', true)
	})
})

// ── clipSpeedChange ────────────────────────────────────────────────────────────

describe('clipSpeedChange — REST path', () => {
	it('set — calls setParam with inputValue/100', async () => {
		const ws = makeWsApi()
		const clipUtils = {
			getClipFromCompositionState: vi.fn().mockReturnValue({ transport: { controls: { speed: { id: 88 } } } }),
		}
		const restApi = {
			Clips: {
				getStatus: vi.fn().mockResolvedValue({ transport: { controls: { speed: { value: 1.0 } } } }),
			},
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('50')  // value
				.mockResolvedValueOnce('1')   // layer
				.mockResolvedValueOnce('2'),  // column
		} as any
		const action = clipSpeedChange(
			() => restApi as any,
			() => ws as any,
			() => null,
			() => clipUtils as any,
			instance
		)
		await (action.callback as any)({ options: { value: '50', layer: '1', column: '2', action: 'set' } })
		expect(ws.setParam).toHaveBeenCalledWith('88', 0.5)
	})
})

describe('clipSpeedChange — OSC path', () => {
	it('set via OSC calls customOsc', async () => {
		const osc = makeOscApi()
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('100')
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('2'),
		} as any
		const action = clipSpeedChange(
			() => null,
			() => null,
			() => osc as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { value: '100', layer: '1', column: '2', action: 'set' } })
		expect(osc.customOsc).toHaveBeenCalled()
	})

	it('add via OSC logs warning', async () => {
		const osc = makeOscApi()
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('10')
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('2'),
		} as any
		const action = clipSpeedChange(
			() => null,
			() => null,
			() => osc as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { value: '10', layer: '1', column: '2', action: 'add' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
		expect(osc.customOsc).toHaveBeenCalled()
	})
})

// ── clipVolumeChange ───────────────────────────────────────────────────────────

describe('clipVolumeChange — REST path', () => {
	it('set — calls setParam with raw value', async () => {
		const ws = makeWsApi()
		const clipUtils = {
			getClipFromCompositionState: vi.fn().mockReturnValue({ audio: { volume: { id: 33 } } }),
		}
		const restApi = {
			Clips: {
				getStatus: vi.fn().mockResolvedValue({ audio: { volume: { value: -6 } } }),
			},
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('-12') // value
				.mockResolvedValueOnce('1')   // layer
				.mockResolvedValueOnce('1'),  // column
		} as any
		const action = clipVolumeChange(
			() => restApi as any,
			() => ws as any,
			() => null,
			() => clipUtils as any,
			instance
		)
		await (action.callback as any)({ options: { value: '-12', layer: '1', column: '1', action: 'set' } })
		expect(ws.setParam).toHaveBeenCalledWith('33', -12)
	})

	it('logs warn and does not call setParam when clip has no volume id (#140)', async () => {
		const ws = makeWsApi()
		const clipUtils = { getClipFromCompositionState: vi.fn().mockReturnValue(undefined) }
		const restApi = { Clips: { getStatus: vi.fn().mockResolvedValue({ audio: { volume: { value: -6 } } }) } }
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('-12')
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('1'),
		} as any
		const action = clipVolumeChange(() => restApi as any, () => ws as any, () => null, () => clipUtils as any, instance)
		await (action.callback as any)({ options: { value: '-12', layer: '1', column: '1', action: 'set' } })
		expect(ws.subscribeParam).not.toHaveBeenCalled()
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})

// ── clipOpacityChange ──────────────────────────────────────────────────────────

describe('clipOpacityChange — REST path', () => {
	it('set — calls subscribeParam + setParam with inputValue/100', async () => {
		const ws = makeWsApi()
		const clipUtils = {
			getClipFromCompositionState: vi.fn().mockReturnValue({ video: { opacity: { id: 200 } } }),
		}
		const restApi = {
			Clips: {
				getStatus: vi.fn().mockResolvedValue({ video: { opacity: { value: 0.5 } } }),
			},
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('80') // value
				.mockResolvedValueOnce('1')  // layer
				.mockResolvedValueOnce('1'), // column
		} as any
		const action = clipOpacityChange(
			() => restApi as any,
			() => ws as any,
			() => null,
			() => clipUtils as any,
			instance
		)
		await (action.callback as any)({ options: { value: '80', layer: '1', column: '1', action: 'set' } })
		expect(ws.subscribeParam).toHaveBeenCalledWith(200)
		expect(ws.setParam).toHaveBeenCalledWith('200', 0.8)
	})

	it('add — adds inputValue/100 to current opacity', async () => {
		const ws = makeWsApi()
		const clipUtils = {
			getClipFromCompositionState: vi.fn().mockReturnValue({ video: { opacity: { id: 200 } } }),
		}
		const restApi = {
			Clips: {
				getStatus: vi.fn().mockResolvedValue({ video: { opacity: { value: 0.5 } } }),
			},
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('20') // value
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('2'),
		} as any
		const action = clipOpacityChange(
			() => restApi as any,
			() => ws as any,
			() => null,
			() => clipUtils as any,
			instance
		)
		await (action.callback as any)({ options: { value: '20', layer: '1', column: '2', action: 'add' } })
		// 0.5 + 0.2 = 0.7
		expect(ws.setParam).toHaveBeenCalledWith('200', expect.closeTo(0.7, 5))
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1', '1', '1')
		const action = clipOpacityChange(() => null, () => ws as any, () => null, () => null, instance)
		await (action.callback as any)({ options: { value: '50', layer: '1', column: '1', action: 'set' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})

	it('logs warn and does not call setParam when clip has no opacity id (#140)', async () => {
		const ws = makeWsApi()
		const clipUtils = { getClipFromCompositionState: vi.fn().mockReturnValue(undefined) }
		const restApi = { Clips: { getStatus: vi.fn().mockResolvedValue({ video: { opacity: { value: 0.5 } } }) } }
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('50')
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('1'),
		} as any
		const action = clipOpacityChange(() => restApi as any, () => ws as any, () => null, () => clipUtils as any, instance)
		await (action.callback as any)({ options: { value: '50', layer: '1', column: '1', action: 'set' } })
		expect(ws.subscribeParam).not.toHaveBeenCalled()
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})
