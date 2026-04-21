/**
 * Integration test for the Disconnect All Clips action (#52).
 *
 * Validates that /composition/disconnect-all via WebSocket actually
 * disconnects a connected clip in Resolume.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { WebsocketInstance } from '../../src/websocket'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)

const mockResolumeInstance: any = {
	log: () => {},
	updateStatus: () => {},
	getWebSocketSubscribers: () => new Set(),
	restartApis: async () => {},
}

const mockConfig: any = {
	host: TEST_HOST,
	webapiPort: REST_PORT,
	useSSL: false,
}

let ws: WebsocketInstance

beforeAll(async () => {
	if (!resolume) return
	ws = new WebsocketInstance(mockResolumeInstance, mockConfig)
	await ws.waitForWebsocketReady()
})

afterAll(async () => {
	if (ws) await ws.destroy()
	// Leave composition clean
	if (resolume) await api.Layers.clear(TEST_LAYER).catch(() => {})
})

describe.skipIf(!resolume)('disconnectAll action — /composition/disconnect-all', () => {
	it('disconnects a connected clip via WebSocket trigger', async () => {
		// Connect a clip first
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)

		const before = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN)) as any
		expect(before?.connected?.value).toMatch(/Connected/)

		// Trigger disconnect-all via WebSocket
		await ws.triggerPath('/composition/disconnect-all')
		await pause(400)

		const after = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN)) as any
		expect(after?.connected?.value).not.toMatch(/^Connected$/)
	})
})
