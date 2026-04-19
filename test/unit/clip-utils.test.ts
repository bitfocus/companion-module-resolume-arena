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
