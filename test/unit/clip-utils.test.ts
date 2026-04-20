import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClipUtils } from '../../src/domain/clip/clip-utils'
import { parameterStates, compositionState } from '../../src/state'

const stubProxy = new Proxy({}, { get: () => vi.fn() })

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
		subscribeParam: vi.fn(),
		unsubscribeParam: vi.fn(),
	}
	const instance = {
		checkFeedbacks: vi.fn(),
		checkFeedbacksById: vi.fn(),
		setVariableValues: vi.fn(),
		setupVariables: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		getConfig: vi.fn().mockReturnValue({ useCroppedThumbs: false }),
		getClipUtils: vi.fn().mockReturnValue(stubProxy),
		getLayerUtils: vi.fn().mockReturnValue(stubProxy),
		restApi: undefined,
		_wsApi: wsApi,
	}
	return instance as any
}

function makeContext(_layer: string, _column?: string) {
	return {
		parseVariablesInString: vi.fn().mockImplementation((s: string) => Promise.resolve(s)),
	} as any
}

function makeFeedback(layer: string, column: string, id = 'fb1') {
	return { id, options: { layer, column } } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

describe('ClipUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("connectedClip") on connect path', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/2/connect', value: 'Connected' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('connectedClip')
	})

	it('calls checkFeedbacks("selectedClip") and "connectedClip" on select path', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/2/select', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('selectedClip')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('connectedClip')
	})

	it('calls setVariableValues with correct layer/column when select value is true', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/2/select', value: true }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith({ selectedClip: JSON.stringify({ layer: '1', column: '2' }) })
		expect(mod.setVariableValues).toHaveBeenCalledWith({ selectedClipLayer: '1' })
		expect(mod.setVariableValues).toHaveBeenCalledWith({ selectedClipColumn: '2' })
	})

	it('does NOT call setVariableValues when select value is false', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/2/select', value: false }, false)
		expect(mod.setVariableValues).not.toHaveBeenCalled()
	})
})

describe('ClipUtils.messageUpdates — clip name variable', () => {
	it('sets clip_name_l{layer}_c{column} when a name path message arrives', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/2/clips/3/name', value: 'MyClip' }, false)
		expect(mod.setVariableValues).toHaveBeenCalledWith({ clip_name_l2_c3: 'MyClip' })
	})

	it('does not call setVariableValues for clip name when path does not match', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/connect', value: 'Connected' }, false)
		expect(mod.setVariableValues).not.toHaveBeenCalledWith(expect.objectContaining({ clip_name_l1_c1: expect.anything() }))
	})

	it('still calls checkFeedbacks("clipInfo") alongside the variable update', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.messageUpdates({ path: '/composition/layers/1/clips/1/name', value: 'Test' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('clipInfo')
	})
})

describe('ClipUtils.getClipNameVariableDefinitions', () => {
	it('returns empty array before composition is loaded', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		expect(cu.getClipNameVariableDefinitions()).toHaveLength(0)
	})

	it('returns one definition per grid cell after initComposition', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [
				{ clips: [{ name: { value: 'A' } }, { name: { value: 'B' } }] },
				{ clips: [{ name: { value: 'C' } }, { name: { value: 'D' } }] },
			]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)
		const defs = cu.getClipNameVariableDefinitions()
		expect(defs).toHaveLength(4)
		const ids = defs.map((d) => d.variableId)
		expect(ids).toContain('clip_name_l1_c1')
		expect(ids).toContain('clip_name_l1_c2')
		expect(ids).toContain('clip_name_l2_c1')
		expect(ids).toContain('clip_name_l2_c2')
	})

	it('handles asymmetric grids — uses max column count across all layers', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [
				{ clips: [{ name: { value: 'A' } }] },
				{ clips: [{ name: { value: 'B' } }, { name: { value: 'C' } }, { name: { value: 'D' } }] },
			]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)
		const defs = cu.getClipNameVariableDefinitions()
		// 2 layers × 3 columns (max)
		expect(defs).toHaveLength(6)
	})
})

describe('ClipUtils.initComposition — clip name subscriptions and initial values', () => {
	it('subscribes to all clip name paths on init', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [
				{ clips: [{ name: { value: 'Clip1' } }, { name: { value: 'Clip2' } }] },
			]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)
		const ws = mod._wsApi
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/1/clips/1/name')
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/1/clips/2/name')
	})

	it('sets initial variable values from composition state on init', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [
				{ clips: [{ name: { value: 'Alpha' } }, { name: { value: 'Beta' } }] },
			]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)
		expect(mod.setVariableValues).toHaveBeenCalledWith(
			expect.objectContaining({ clip_name_l1_c1: 'Alpha', clip_name_l1_c2: 'Beta' })
		)
	})

	it('calls setupVariables() to register the dynamic definitions', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [{ clips: [{ name: { value: 'X' } }] }]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)
		expect(mod.setupVariables).toHaveBeenCalled()
	})

	it('unsubscribes old paths and resubscribes on composition reload', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		compositionState.set({
			layers: [{ clips: [{ name: { value: 'Old' } }] }]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)

		const ws = mod._wsApi
		ws.subscribePath.mockClear()
		ws.unsubscribePath.mockClear()

		compositionState.set({
			layers: [{ clips: [{ name: { value: 'New' } }, { name: { value: 'New2' } }] }]
		} as any)
		cu.messageUpdates({ path: '', value: '' }, true)

		expect(ws.unsubscribePath).toHaveBeenCalledWith('/composition/layers/1/clips/1/name')
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/1/clips/1/name')
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/1/clips/2/name')
	})
})

describe('ClipUtils.clipConnectedWebsocketSubscribe / Unsubscribe', () => {
	it('subscribes to both connect and name paths', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.clipConnectedWebsocketSubscribe(2, 3)
		const ws = mod._wsApi
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/2/clips/3/connect')
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/2/clips/3/name')
	})

	it('unsubscribes from both connect and name paths', () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		cu.clipConnectedWebsocketUnsubscribe(2, 3)
		const ws = mod._wsApi
		expect(ws.unsubscribePath).toHaveBeenCalledWith('/composition/layers/2/clips/3/connect')
		expect(ws.unsubscribePath).toHaveBeenCalledWith('/composition/layers/2/clips/3/name')
	})
})

describe('ClipUtils.clipConnectedFeedbackCallback — previewedClipName', () => {
	function makeConnectedFeedback(layer: string, column: string, id = 'fb1') {
		return {
			id,
			options: {
				layer,
				column,
				color_connected: 0,
				color_connected_selected: 0,
				color_connected_preview: 0,
				color_preview: 0,
			},
		} as any
	}

	it('sets previewedClipName when clip is Previewing and name is in parameterStates', async () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		parameterStates.set({
			'/composition/layers/1/clips/2/connect': { value: 'Previewing' },
			'/composition/layers/1/clips/2/name': { value: 'MyAwesomeClip' },
		} as any)
		await cu.clipConnectedFeedbackCallback(makeConnectedFeedback('1', '2'), makeContext('1', '2'))
		expect(mod.setVariableValues).toHaveBeenCalledWith({ previewedClipName: 'MyAwesomeClip' })
	})

	it('sets previewedClipName when clip is Connected & previewing', async () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		parameterStates.set({
			'/composition/layers/3/clips/4/connect': { value: 'Connected & previewing' },
			'/composition/layers/3/clips/4/name': { value: 'OtherClip' },
		} as any)
		await cu.clipConnectedFeedbackCallback(makeConnectedFeedback('3', '4'), makeContext('3', '4'))
		expect(mod.setVariableValues).toHaveBeenCalledWith({ previewedClipName: 'OtherClip' })
	})

	it('does not set previewedClipName when clip is only Connected (no preview)', async () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		parameterStates.set({
			'/composition/layers/1/clips/1/connect': { value: 'Connected' },
			'/composition/layers/1/clips/1/name': { value: 'SomeClip' },
		} as any)
		await cu.clipConnectedFeedbackCallback(makeConnectedFeedback('1', '1'), makeContext('1', '1'))
		expect(mod.setVariableValues).not.toHaveBeenCalledWith({ previewedClipName: expect.anything() })
	})
})

describe('ClipUtils.clipSelectedFeedbackCallback', () => {
	it('returns true when parameterStates has select = true for the clip', async () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		parameterStates.set({
			'/composition/layers/1/clips/2/select': { value: true },
			'/composition/layers/1/clips/2/name': { value: 'TestClip' },
		} as any)
		const result = await cu.clipSelectedFeedbackCallback(makeFeedback('1', '2'), makeContext('1', '2'))
		expect(result).toBe(true)
	})

	it('returns undefined/falsy when clip is not selected', async () => {
		const mod = makeMockModule()
		const cu = new ClipUtils(mod)
		parameterStates.set({
			'/composition/layers/1/clips/2/select': { value: false },
		} as any)
		const result = await cu.clipSelectedFeedbackCallback(makeFeedback('1', '2'), makeContext('1', '2'))
		expect(result).toBeFalsy()
	})
})
