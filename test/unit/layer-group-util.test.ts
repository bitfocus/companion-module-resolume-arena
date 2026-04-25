import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LayerGroupUtils } from '../../src/domain/layer-groups/layer-group-util'
import { parameterStates, compositionState } from '../../src/state'

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		subscribeParam: vi.fn(),
		unsubscribeParam: vi.fn(),
	}
	const instance = {
		checkFeedbacks: vi.fn(),
		setVariableValues: vi.fn(),
		setupVariables: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		_wsApi: wsApi,
	}
	return instance as any
}

function makeContext(resolved: string) {
	return { parseVariablesInString: vi.fn().mockResolvedValue(resolved) } as any
}

function makeFeedback(opts: Record<string, any>, id = 'fb1') {
	return { id, options: opts } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── messageUpdates — path matching ────────────────────────────────────────────

describe('LayerGroupUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("layerGroupBypassed") on bypassed path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/bypassed', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupBypassed')
	})

	it('calls checkFeedbacks("layerGroupSolo") on solo path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/2/solo', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupSolo')
	})

	it('calls checkFeedbacks("layerGroupSelected") on select path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/select', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupSelected')
	})

	it('calls checkFeedbacks("layerGroupMaster") on master path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/master', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupMaster')
	})

	it('calls checkFeedbacks("layerGroupOpacity") on opacity path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/video/opacity', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupOpacity')
	})

	it('calls checkFeedbacks("layerGroupVolume") on volume path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/audio/volume', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupVolume')
	})

	it('calls checkFeedbacks("layerGroupSpeed") on speed path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/speed', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupSpeed')
	})

	it('updates selectedLayerGroupColumns on column select with value=true', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/groups/1/columns/3/select', value: true }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupColumnsSelected')
	})

	it('calls checkFeedbacks("layerGroupColumnsConnected") on column connect path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/columns/2/connect': { value: 'Connected' } } as any)
		lgu.messageUpdates({ path: '/composition/groups/1/columns/2/connect', value: true }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupColumnsConnected')
	})

	it('does not call checkFeedbacks for unrelated path', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: '/composition/tempo', value: false }, false)
		expect(mod.checkFeedbacks).not.toHaveBeenCalled()
	})

	it('calls composition-wide update methods when isComposition=true', () => {
		const mod = makeMockModule()
		compositionState.set({ layergroups: [] } as any)
		const lgu = new LayerGroupUtils(mod)
		lgu.messageUpdates({ path: undefined, value: false }, true)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('layerGroupActive')
	})
})

// ── bypass subscribe / unsubscribe ────────────────────────────────────────────

describe('LayerGroupUtils — bypass subscribe / unsubscribe', () => {
	it('subscribes to WebSocket path on first subscribe call', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('does not subscribe twice for same layer group', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'b'), makeContext('1'))
		expect(mod._wsApi.subscribePath).toHaveBeenCalledTimes(1)
	})

	it('calls unsubscribePath when last subscriber is removed', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		await lgu.layerGroupBypassedFeedbackUnsubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		expect(mod._wsApi.unsubscribePath).toHaveBeenCalledWith('/composition/layergroups/1/bypassed')
	})

	it('does not unsubscribe while other subscribers remain', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		await lgu.layerGroupBypassedFeedbackSubscribe(makeFeedback({ layerGroup: '1' }, 'b'), makeContext('1'))
		await lgu.layerGroupBypassedFeedbackUnsubscribe(makeFeedback({ layerGroup: '1' }, 'a'), makeContext('1'))
		expect(mod._wsApi.unsubscribePath).not.toHaveBeenCalled()
	})
})

// ── bypass feedback callback ───────────────────────────────────────────────────

describe('LayerGroupUtils.layerGroupBypassedFeedbackCallback', () => {
	it('returns true when group is bypassed', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/bypassed': { value: true } } as any)
		const result = await lgu.layerGroupBypassedFeedbackCallback(makeFeedback({ layerGroup: '1' }), makeContext('1'))
		expect(result).toBe(true)
	})

	it('returns false when group is not bypassed', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/bypassed': { value: false } } as any)
		const result = await lgu.layerGroupBypassedFeedbackCallback(makeFeedback({ layerGroup: '1' }), makeContext('1'))
		expect(result).toBe(false)
	})
})

// ── solo feedback callback ─────────────────────────────────────────────────────

describe('LayerGroupUtils.layerGroupSoloFeedbackCallback', () => {
	it('returns true when group is soloed', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/2/solo': { value: true } } as any)
		const result = await lgu.layerGroupSoloFeedbackCallback(makeFeedback({ layerGroup: '2' }), makeContext('2'))
		expect(result).toBe(true)
	})
})

// ── selected feedback callback ─────────────────────────────────────────────────

describe('LayerGroupUtils.layerGroupSelectedFeedbackCallback', () => {
	it('returns true when group is selected', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/select': { value: true } } as any)
		const result = await lgu.layerGroupSelectedFeedbackCallback(makeFeedback({ layerGroup: '1' }), makeContext('1'))
		expect(result).toBe(true)
	})
})

// ── active feedback callback ───────────────────────────────────────────────────

describe('LayerGroupUtils.layerGroupActiveFeedbackCallback', () => {
	it('returns false when no active layer group', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		const result = await lgu.layerGroupActiveFeedbackCallback(makeFeedback({ layerGroup: '1' }), makeContext('1'))
		expect(result).toBe(false)
	})

	it('returns true when layer group is active', async () => {
		const mod = makeMockModule()
		compositionState.set({
			layers: [{ id: 10 }, { id: 20 }, { id: 30 }],
			columns: [{}],
			layergroups: [
				{ layers: [{ id: 20, clips: [{}] }, { id: 30, clips: [{}] }] },
			],
		} as any)
		parameterStates.set({
			'/composition/layers/2/clips/1/connect': { value: 'Connected' },
		} as any)

		const lgu = new LayerGroupUtils(mod)
		lgu.updateActiveLayerGroups()

		const result = await lgu.layerGroupActiveFeedbackCallback(makeFeedback({ layerGroup: '1' }), makeContext('1'))
		expect(result).toBe(true)
	})
})

// ── column name feedback callback ─────────────────────────────────────────────

describe('LayerGroupUtils.layerGroupColumnNameFeedbackCallback', () => {
	it('returns text from parameterStates replacing # with column number', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/columns/2/name': { value: 'Col #' } } as any)
		const ctx = {
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('2')   // column
				.mockResolvedValueOnce('1'),  // layerGroup
		} as any
		const result = await lgu.layerGroupColumnNameFeedbackCallback(makeFeedback({ column: '2', layerGroup: '1' }), ctx)
		expect((result as any).text).toBe('Col 2')
	})

	it('returns empty object when no name in state', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		const ctx = {
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('3')
				.mockResolvedValueOnce('1'),
		} as any
		const result = await lgu.layerGroupColumnNameFeedbackCallback(makeFeedback({ column: '3', layerGroup: '1' }), ctx)
		expect(result).toEqual({})
	})
})

// ── columns connected feedback callback ──────────────────────────────────────

describe('LayerGroupUtils.layerGroupColumnsConnectedFeedbackCallback', () => {
	it('returns true when column state is Connected', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/columns/2/connect': { value: 'Connected' } } as any)
		const ctx = {
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('2'),
		} as any
		const result = await lgu.layerGroupColumnsConnectedFeedbackCallback(makeFeedback({ layerGroup: '1', column: '2' }), ctx)
		expect(result).toBe(true)
	})

	it('returns false when column state is Disconnected', async () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		parameterStates.set({ '/composition/groups/1/columns/2/connect': { value: 'Disconnected' } } as any)
		const ctx = {
			parseVariablesInString: vi.fn()
				.mockResolvedValueOnce('1')
				.mockResolvedValueOnce('2'),
		} as any
		const result = await lgu.layerGroupColumnsConnectedFeedbackCallback(makeFeedback({ layerGroup: '1', column: '2' }), ctx)
		expect(result).toBe(false)
	})
})

// ── calculateNextSelectedLayerGroupColumn ─────────────────────────────────────

describe('LayerGroupUtils.calculateNextSelectedLayerGroupColumn', () => {
	it('advances column by add amount', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		// Set internal state via messageUpdates trick
		lgu['selectedLayerGroupColumns'].set(1, 2)
		lgu['lastLayerGroupColumns'].set(1, 4)
		expect(lgu.calculateNextSelectedLayerGroupColumn(1, 1)).toBe(3)
	})

	it('wraps around when at last column', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu['selectedLayerGroupColumns'].set(1, 4)
		lgu['lastLayerGroupColumns'].set(1, 4)
		expect(lgu.calculateNextSelectedLayerGroupColumn(1, 1)).toBe(1)
	})

	it('wraps around when add goes past last column', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu['selectedLayerGroupColumns'].set(1, 3)
		lgu['lastLayerGroupColumns'].set(1, 4)
		expect(lgu.calculateNextSelectedLayerGroupColumn(1, 2)).toBe(1)
	})
})

// ── calculatePreviousSelectedLayerGroupColumn ─────────────────────────────────

describe('LayerGroupUtils.calculatePreviousSelectedLayerGroupColumn', () => {
	it('decrements column by subtract amount', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu['selectedLayerGroupColumns'].set(1, 3)
		lgu['lastLayerGroupColumns'].set(1, 4)
		expect(lgu.calculatePreviousSelectedLayerGroupColumn(1, 1)).toBe(2)
	})

	it('wraps around when at first column', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		lgu['selectedLayerGroupColumns'].set(1, 1)
		lgu['lastLayerGroupColumns'].set(1, 4)
		expect(lgu.calculatePreviousSelectedLayerGroupColumn(1, 1)).toBe(4)
	})
})

// ── getLayerGroupFromCompositionState ─────────────────────────────────────────

describe('LayerGroupUtils.getLayerGroupFromCompositionState', () => {
	it('returns the correct layer group by 1-based index', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({
			layergroups: [
				{ id: 100 } as any,
				{ id: 200 } as any,
			],
		} as any)
		expect(lgu.getLayerGroupFromCompositionState(1)).toMatchObject({ id: 100 })
		expect(lgu.getLayerGroupFromCompositionState(2)).toMatchObject({ id: 200 })
	})

	it('returns undefined when compositionState is empty', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		expect(lgu.getLayerGroupFromCompositionState(1)).toBeUndefined()
	})
})

// ── updateActiveLayerGroups — variable writes ─────────────────────────────────

describe('LayerGroupUtils.updateActiveLayerGroups — variable writes', () => {
	it('sets ws_layergroup_N_active=1 when a clip in the group is connected', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({
			layers: [{ id: 10, clips: [{ id: 1 }, { id: 2 }] }],
			layergroups: [{ layers: [{ id: 10, clips: [{ id: 1 }, { id: 2 }] }] }],
		} as any)
		parameterStates.set({ '/composition/layers/1/clips/1/connect': { value: 'Connected' } } as any)
		lgu.updateActiveLayerGroups()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layergroup_1_active: '1',
		}))
	})

	it('sets ws_layergroup_N_active=0 when no clip in the group is connected', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({
			layers: [{ id: 10, clips: [{}] }],
			layergroups: [{ layers: [{ id: 10, clips: [{}] }] }],
		} as any)
		parameterStates.set({} as any)
		lgu.updateActiveLayerGroups()
		expect(mod.setVariableValues).toHaveBeenCalledWith(expect.objectContaining({
			ws_layergroup_1_active: '0',
			ws_layergroup_1_connected_column: '0',
		}))
	})

	it('calls setupVariables when group count changes', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({ layers: [], layergroups: [{}, {}] } as any)
		lgu.updateActiveLayerGroups()
		expect(mod.setupVariables).toHaveBeenCalledTimes(1)
		lgu.updateActiveLayerGroups()
		expect(mod.setupVariables).toHaveBeenCalledTimes(1)
	})
})

// ── unconditional WS subscription on composition update ───────────────────────

describe('LayerGroupUtils — unconditional WS subscription on composition update', () => {
	function makeGroupComposition(groups: number) {
		return {
			layers: [],
			layergroups: Array.from({ length: groups }, (_, i) => ({
				audio: { volume: { id: 300 + i } },
				video: { opacity: { id: 400 + i } },
				layers: [],
			})),
		} as any
	}

	it('updateLayerGroupVolumes subscribes all groups regardless of active subscriptions', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set(makeGroupComposition(3))
		lgu.updateLayerGroupVolumes()
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(300)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(301)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(302)
	})

	it('updateLayerGroupOpacities subscribes all groups regardless of active subscriptions', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set(makeGroupComposition(2))
		lgu.updateLayerGroupOpacities()
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(400)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(401)
	})

	it('updateLayerGroupMasters subscribes /composition/layergroups/N/master for all groups', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({ layers: [], layergroups: [{}, {}, {}] } as any)
		lgu.updateLayerGroupMasters()
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/1/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/2/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/3/master')
	})

	it('updateLayerGroupSpeeds subscribes /composition/layergroups/N/speed for all groups', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({ layers: [], layergroups: [{}, {}] } as any)
		lgu.updateLayerGroupSpeeds()
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/1/speed')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/2/speed')
	})

	it('messageUpdates(isComposition=true) triggers subscribe for all groups', () => {
		const mod = makeMockModule()
		const lgu = new LayerGroupUtils(mod)
		compositionState.set({ layers: [], layergroups: [{ audio: { volume: { id: 50 } }, video: { opacity: { id: 60 } }, layers: [] }] } as any)
		lgu.messageUpdates({ path: undefined, value: false }, true)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(50)
		expect(mod._wsApi.subscribeParam).toHaveBeenCalledWith(60)
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/1/master')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/layergroups/1/speed')
	})
})
