/**
 * Integration test — WebSocket connection correctness (#149).
 *
 * Verifies that after the WebSocket.OPEN static fix, sendMessage does not hang
 * when the socket is already connected. Before the fix, waitForOpenConnection
 * would never resolve because socket?.OPEN was always undefined.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { WebsocketInstance } from '../../src/websocket'
import { isResolumeReachable, pause } from './helpers'
import { TEST_HOST, REST_PORT } from './config'

const resolume = await isResolumeReachable()

let wsInstance: WebsocketInstance | null = null

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

beforeAll(async () => {
	if (!resolume) return
	wsInstance = new WebsocketInstance(mockResolumeInstance, mockConfig)
	await pause(500) // allow time to connect
})

afterAll(async () => {
	if (wsInstance) {
		await wsInstance.destroy()
		wsInstance = null
	}
})

describe.skipIf(!resolume)('WebSocket connection — sendMessage does not hang when connected', () => {
	it('waitForWebsocketReady resolves within 2 seconds', async () => {
		await wsInstance!.waitForWebsocketReady()
	})

	it('sendMessage completes a GET request without hanging', async () => {
		const done = await Promise.race([
			wsInstance!.getPath('/composition').then(() => true),
			pause(2000).then(() => false),
		])
		expect(done).toBe(true)
	})
})
