import { vi } from 'vitest'
import { ResolumeArenaModuleInstance } from '../../../src/index.js'

/**
 * A stand-in for the context object the Companion host hands to the module constructor (API 2.x).
 * Every host call is a spy, so tests can inspect what the real module instance registers.
 */
export function makeHostContext(label = 'arena') {
	return {
		_isInstanceContext: true as const,
		id: 'test-instance',
		label,
		upgradeScripts: [],
		saveConfig: vi.fn(),
		updateStatus: vi.fn(),
		oscSend: vi.fn(),
		recordAction: vi.fn(),
		setActionDefinitions: vi.fn(),
		subscribeActions: vi.fn(),
		unsubscribeActions: vi.fn(),
		setFeedbackDefinitions: vi.fn(),
		unsubscribeFeedbacks: vi.fn(),
		checkFeedbacks: vi.fn(),
		checkAllFeedbacks: vi.fn(),
		checkFeedbacksById: vi.fn(),
		setPresetDefinitions: vi.fn(),
		setCompositeElementDefinitions: vi.fn(),
		setVariableDefinitions: vi.fn(),
		setVariableValues: vi.fn(),
		getVariableValue: vi.fn(),
		sharedUdpSocketHandlers: new Map(),
		sharedUdpSocketJoin: vi.fn(),
		sharedUdpSocketLeave: vi.fn(),
		sharedUdpSocketSend: vi.fn(),
	}
}

export type FakeHostContext = ReturnType<typeof makeHostContext>

/** Constructs the real module instance against a fake host, without opening any connection. */
export function makeModuleInstance(label = 'arena'): { instance: ResolumeArenaModuleInstance; host: FakeHostContext } {
	const host = makeHostContext(label)
	const instance = new ResolumeArenaModuleInstance(host)
	return { instance, host }
}
