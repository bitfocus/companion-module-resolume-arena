/**
 * WS transport timing variable integration tests.
 *
 * Verifies the data contract that drives ws_layer_N_elapsed_seconds /
 * ws_layer_N_remaining_seconds: the REST transport.position structure
 * that Resolume exposes and the WebSocket module reads via parameterStates.
 *
 * We cannot assert Companion variable values directly (no live module),
 * so we assert the REST state that drives them — the same pattern used
 * in clip-name-variable.test.ts and feedback-data-contract.test.ts.
 *
 * Prerequisites:
 *   - Resolume REST on REST_PORT (default 8080)
 *   - Resolume OSC Input on OSC_SEND_PORT (default 7000)
 *   - Clip with media at TEST_LAYER / TEST_COLUMN
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => any
}

let udp: any

beforeAll(async () => {
	if (!resolume) return
	udp = new osc.UDPPort({ localAddress: '0.0.0.0', localPort: 0, metadata: true })
	await new Promise<void>((resolve) => {
		udp.on('ready', resolve)
		udp.open()
	})
})

afterAll(async () => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

function sendOsc(path: string, args: any[]) {
	udp.send({ address: path, args }, TEST_HOST, OSC_SEND_PORT)
}

async function getTransportPosition(): Promise<{ value: number; max: number } | null> {
	const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
	const pos = clip?.transport?.position
	if (pos?.value === undefined || pos?.max === undefined) return null
	return { value: pos.value, max: pos.max }
}

// ── Data contract ─────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('WS transport — data contract (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected clip exposes transport.position with numeric value and max > 0', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const pos = await getTransportPosition()
		if (pos === null) return // clip type has no fixed-duration transport
		expect(typeof pos.value).toBe('number')
		expect(pos.max).toBeGreaterThan(0)
	})

	it('transport.position.max / 1000 approximates clip duration in seconds', async () => {
		const pos = await getTransportPosition()
		if (pos === null) return
		// max / 1000 should be a plausible clip duration (> 1s, < 2h)
		const durationSec = pos.max / 1000
		expect(durationSec).toBeGreaterThan(1)
		expect(durationSec).toBeLessThan(7200)
	})
})

// ── Position advances while playing ──────────────────────────────────────────

describe.skipIf(!resolume)('WS transport — position advances while playing (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('transport.position.value increases after 500ms of playback', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)

		const p1 = await getTransportPosition()
		if (p1 === null) return

		await pause(500)

		const p2 = await getTransportPosition()
		if (p2 === null) return

		expect(p2.value).toBeGreaterThan(p1.value)
	})
})

// ── Position stable when paused ───────────────────────────────────────────────

describe.skipIf(!resolume)('WS transport — position stable when paused (requires media)', () => {
	const clipUrl = `http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}`

	async function putClip(body: any): Promise<void> {
		const { default: fetch } = await import('node-fetch')
		await fetch(clipUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			timeout: 3000,
		} as any)
	}

	afterAll(async () => {
		// Restore speed and clear
		await putClip({ transport: { controls: { speed: { value: 1.0 } } } })
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('transport.position.value does not advance when speed is 0', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)

		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport?.controls?.speed == null) return

		// Freeze playback via speed=0
		await putClip({ transport: { controls: { speed: { value: 0 } } } })
		await pause(300)

		const p1 = await getTransportPosition()
		if (p1 === null) return

		await pause(500)

		const p2 = await getTransportPosition()
		if (p2 === null) return

		// Allow tiny delta for floating point / REST polling jitter (0.1% of total duration)
		expect(Math.abs(p2.value - p1.value)).toBeLessThan(p1.max * 0.001)
	})
})
