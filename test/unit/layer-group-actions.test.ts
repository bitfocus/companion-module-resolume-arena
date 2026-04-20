import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bypassLayerGroup } from '../../src/actions/layer-group/actions/bypass-layer-group'
import { soloLayerGroup } from '../../src/actions/layer-group/actions/solo-layer-group'
import { clearLayerGroup } from '../../src/actions/layer-group/actions/clear-layer-group'
import { layerGroupMasterChange } from '../../src/actions/layer-group/actions/layer-group-master-change'
import { layerGroupOpacityChange } from '../../src/actions/layer-group/actions/layer-group-opacity-change'
import { parameterStates, compositionState } from '../../src/state'

function makeWsApi() {
	return { setPath: vi.fn(), setParam: vi.fn(), triggerPath: vi.fn() }
}

function makeOscApi() {
	return {
		bypassLayerGroup: vi.fn(),
		clearLayerGroup: vi.fn(),
	}
}

function makeInstance(parseResult = '1') {
	return {
		log: vi.fn(),
		parseVariablesInString: vi.fn().mockResolvedValue(parseResult),
	} as any
}

beforeEach(() => {
	parameterStates.set({})
	compositionState.set(undefined)
})

// ── bypassLayerGroup ───────────────────────────────────────────────────────────

describe('bypassLayerGroup — REST path', () => {
	it('bypass=on sets bypassed to true via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = bypassLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'on' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed', true)
	})

	it('bypass=off sets bypassed to false via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = bypassLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'off' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed', false)
	})

	it('bypass=toggle flips current state from true to false', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/groups/1/bypassed': { value: true } } as any)
		const instance = makeInstance('1')
		const action = bypassLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'toggle' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed', false)
	})

	it('bypass=toggle flips current state from false to true', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/groups/1/bypassed': { value: false } } as any)
		const instance = makeInstance('1')
		const action = bypassLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', bypass: 'toggle' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed', true)
	})
})

describe('bypassLayerGroup — OSC path', () => {
	it('bypass=on calls oscApi.bypassLayerGroup with OscArgs.One', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = bypassLayerGroup(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2', bypass: 'on' } })
		expect(osc.bypassLayerGroup).toHaveBeenCalledWith(2, expect.objectContaining({ value: 1 }))
	})

	it('bypass=off calls oscApi.bypassLayerGroup with OscArgs.Zero', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = bypassLayerGroup(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2', bypass: 'off' } })
		expect(osc.bypassLayerGroup).toHaveBeenCalledWith(2, expect.objectContaining({ value: 0 }))
	})

	it('bypass=toggle via OSC logs a warning and does not call bypassLayerGroup', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('2')
		const action = bypassLayerGroup(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '2', bypass: 'toggle' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
		expect(osc.bypassLayerGroup).not.toHaveBeenCalled()
	})
})

// ── soloLayerGroup ─────────────────────────────────────────────────────────────

describe('soloLayerGroup', () => {
	it('solo=on sets solo to true', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = soloLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', solo: 'on' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/solo', true)
	})

	it('solo=off sets solo to false', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1')
		const action = soloLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', solo: 'off' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/solo', false)
	})

	it('solo=toggle flips current state', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/groups/1/solo': { value: false } } as any)
		const instance = makeInstance('1')
		const action = soloLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', solo: 'toggle' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/solo', true)
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const action = soloLayerGroup(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', solo: 'on' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})
})

// ── clearLayerGroup ────────────────────────────────────────────────────────────

describe('clearLayerGroup — REST path', () => {
	it('triggers clear for each layer in the group that matches composition', async () => {
		const ws = makeWsApi()
		compositionState.set({
			layers: [{ id: 10 }, { id: 20 }, { id: 30 }],
			layergroups: [
				{
					layers: [{ id: 20, clips: [{}] }, { id: 30, clips: [{}] }],
				},
			],
		} as any)
		const instance = makeInstance('1')
		const action = clearLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/2/clear')
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/3/clear')
	})

	it('does nothing if compositionState has no layergroups', async () => {
		const ws = makeWsApi()
		compositionState.set({ layers: [], layergroups: undefined } as any)
		const action = clearLayerGroup(() => ({} as any), () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})

	it('does not crash when layer group index is out of bounds (#143)', async () => {
		const ws = makeWsApi()
		compositionState.set({
			layers: [{ id: 10 }],
			layergroups: [{ layers: [{ id: 10, clips: [{}] }] }],
		} as any)
		const instance = makeInstance('5')
		const action = clearLayerGroup(() => ({} as any), () => ws as any, () => null, instance)
		await expect((action.callback as any)({ options: { layer: '5' } })).resolves.not.toThrow()
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

describe('clearLayerGroup — OSC path', () => {
	it('calls oscApi.clearLayerGroup when no REST api', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('1')
		const action = clearLayerGroup(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '1' } })
		expect(osc.clearLayerGroup).toHaveBeenCalledWith(1)
	})
})

// ── layerGroupMasterChange ─────────────────────────────────────────────────────

describe('layerGroupMasterChange', () => {
	it('set — calls setPath with inputValue/100', async () => {
		const ws = makeWsApi()
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')  // layer
				.mockResolvedValueOnce('50'), // value
		} as any
		const action = layerGroupMasterChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/master', 0.5)
	})

	it('add — adds to current parameterState value', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/groups/1/master': { value: 0.5 } } as any)
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('20'),
		} as any
		const action = layerGroupMasterChange(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', action: 'add', value: '20' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/layergroups/1/master', expect.closeTo(0.7, 5))
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const action = layerGroupMasterChange(() => null, () => ws as any, () => null, makeInstance())
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})
})

// ── layerGroupOpacityChange ────────────────────────────────────────────────────

describe('layerGroupOpacityChange', () => {
	it('set — calls setParam with inputValue/100', async () => {
		const ws = makeWsApi()
		compositionState.set({
			layergroups: [{ video: { opacity: { id: 77 } } }],
		} as any)
		const layerGroupUtils = {
			getLayerGroupFromCompositionState: vi.fn().mockReturnValue({ video: { opacity: { id: 77 } } }),
		}
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('80'),
		} as any
		const action = layerGroupOpacityChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => layerGroupUtils as any,
			instance
		)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '80' } })
		expect(ws.setParam).toHaveBeenCalledWith('77', 0.8)
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const layerGroupUtils = { getLayerGroupFromCompositionState: vi.fn() }
		const action = layerGroupOpacityChange(
			() => null,
			() => ws as any,
			() => null,
			() => layerGroupUtils as any,
			makeInstance()
		)
		await (action.callback as any)({ options: { layer: '1', action: 'set', value: '50' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})
})
