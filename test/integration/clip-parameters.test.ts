/**
 * Clip parameter integration tests (section 2.9):
 * - Clip opacity / volume / speed write via REST while a clip is connected
 * - Clip opacity change via OSC
 * All tests require media in TEST_LAYER / TEST_COLUMN.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, testClipHasMedia, pause } from './helpers'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => any
}

const resolume = await isResolumeReachable()
const hasMedia = resolume && (await testClipHasMedia())

const api = new ArenaRestApi(TEST_HOST, REST_PORT)
const clipUrl = `http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}`
let oscApi: ArenaOscApi
let udp: any

async function putClip(body: any): Promise<void> {
	const { default: fetch } = await import('node-fetch')
	await fetch(clipUrl, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		timeout: 3000,
	} as any)
}

beforeAll(async () => {
	if (!resolume) return
	udp = new osc.UDPPort({ localAddress: '0.0.0.0', localPort: 0, metadata: true })
	await new Promise<void>((resolve) => {
		udp.on('ready', resolve)
		udp.open()
	})
	oscApi = new ArenaOscApi(TEST_HOST, OSC_SEND_PORT, (host, port, path, args) => {
		udp.send({ address: path, args: Array.isArray(args) ? args : [args] }, host, port)
	})
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── Clip opacity write via REST ───────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('REST write — clip video opacity (requires media)', () => {
	let originalOpacity: number | undefined

	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		originalOpacity = clip?.video?.opacity?.value
	})

	afterAll(async () => {
		if (originalOpacity !== undefined) {
			await putClip({ video: { opacity: { value: originalOpacity } } })
		}
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('sets clip opacity to 0.25 and REST confirms', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.video?.opacity == null) return
		await putClip({ video: { opacity: { value: 0.25 } } })
		await pause(200)
		const updated = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(updated?.video?.opacity?.value).toBeCloseTo(0.25, 2)
	})

	it('sets clip opacity back to 1.0 and REST confirms', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.video?.opacity == null) return
		await putClip({ video: { opacity: { value: 1.0 } } })
		await pause(200)
		const updated = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(updated?.video?.opacity?.value).toBeCloseTo(1.0, 2)
	})
})

// ── Clip volume write via REST ────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('REST write — clip audio volume (requires media)', () => {
	let originalVolume: number | undefined

	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		originalVolume = clip?.audio?.volume?.value
	})

	afterAll(async () => {
		if (originalVolume !== undefined) {
			await putClip({ audio: { volume: { value: originalVolume } } })
		}
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('sets clip volume to 0.5 and REST confirms', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.audio?.volume == null) return
		await putClip({ audio: { volume: { value: 0.5 } } })
		await pause(200)
		const updated = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(updated?.audio?.volume?.value).toBeCloseTo(0.5, 2)
	})
})

// ── Clip speed write via REST ─────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('REST write — clip transport speed (requires media)', () => {
	let originalSpeed: number | undefined

	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		originalSpeed = clip?.transport?.controls?.speed?.value
	})

	afterAll(async () => {
		if (originalSpeed !== undefined) {
			await putClip({ transport: { controls: { speed: { value: originalSpeed } } } })
		}
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('sets clip speed to 0.5 and REST confirms', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport?.controls?.speed == null) return
		await putClip({ transport: { controls: { speed: { value: 0.5 } } } })
		await pause(200)
		const updated = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(updated?.transport?.controls?.speed?.value).toBeCloseTo(0.5, 2)
	})
})

// ── Clip opacity change via OSC ───────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — clip video opacity change (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('sends clip opacity 0.75 via OSC and REST confirms', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.video?.opacity == null) return

		oscApi.send(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/video/opacity`,
			[{ type: 'f', value: 0.75 }]
		)
		await pause(300)

		const updated = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (updated?.video?.opacity != null) {
			expect(updated.video.opacity.value).toBeCloseTo(0.75, 2)
		}
	})
})
