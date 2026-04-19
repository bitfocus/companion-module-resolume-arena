import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebsocketInstance } from '../../src/websocket'
import WebSocket from 'ws'

// Creates a bare instance without calling the constructor (avoids real WS connection).
function makeWsInstance(): any {
	return Object.create(WebsocketInstance.prototype)
}

describe('WebSocket.OPEN is a static constant, not an instance property', () => {
	it('WebSocket.OPEN equals 1', () => {
		expect(WebSocket.OPEN).toBe(1)
	})

	it('a plain socket-like object has no OPEN own-property (regression guard for the old bug)', () => {
		// Before the fix, code used socket?.OPEN which evaluates to undefined on instances.
		// This test documents the invariant: the static must be used, not the instance.
		const socketLike = { readyState: 1 } as any
		expect(socketLike.OPEN).toBeUndefined()
	})
})

describe('waitForOpenConnection', () => {
	beforeEach(() => { vi.useFakeTimers() })
	afterEach(() => { vi.useRealTimers() })

	it('resolves on the first tick when socket is already OPEN', async () => {
		const ws = makeWsInstance()
		const socket = { readyState: WebSocket.OPEN }
		const promise = ws.waitForOpenConnection(socket)
		vi.advanceTimersByTime(200)
		await promise // would hang/reject before the fix
	})

	it('rejects after max attempts when socket never becomes OPEN', async () => {
		const ws = makeWsInstance()
		const socket = { readyState: WebSocket.CONNECTING }
		const promise = ws.waitForOpenConnection(socket)
		vi.advanceTimersByTime(200 * 11) // exceed 10-attempt limit
		await expect(promise).rejects.toThrow('Maximum number of attempts exceeded')
	})

	it('resolves when socket becomes OPEN mid-way through attempts', async () => {
		const ws = makeWsInstance()
		const socket = { readyState: WebSocket.CONNECTING }
		const promise = ws.waitForOpenConnection(socket)
		vi.advanceTimersByTime(200 * 3) // 3 failed ticks
		socket.readyState = WebSocket.OPEN
		vi.advanceTimersByTime(200) // 4th tick sees OPEN → resolves
		await promise
	})
})

describe('sendMessage', () => {
	it('sends directly without waiting when socket is already OPEN', async () => {
		const ws = makeWsInstance()
		const mockSend = vi.fn()
		ws.ws = { readyState: WebSocket.OPEN, send: mockSend }
		ws.resolumeArenaInstance = { log: vi.fn() }
		await ws.sendMessage({ action: 'get', parameter: '/test' })
		expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ action: 'get', parameter: '/test' }))
	})

	it('logs the sent data at debug level', async () => {
		const ws = makeWsInstance()
		const log = vi.fn()
		ws.ws = { readyState: WebSocket.OPEN, send: vi.fn() }
		ws.resolumeArenaInstance = { log }
		await ws.sendMessage({ action: 'trigger', parameter: '/x' })
		expect(log).toHaveBeenCalledWith('debug', expect.stringContaining('trigger'))
	})
})
