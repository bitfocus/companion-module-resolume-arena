import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, testClipHasMedia, pause } from './helpers'

// No @types/osc exists — require with inline interface
// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => OscUDPPort
}

interface OscUDPPort {
	on(event: string, cb: (...args: any[]) => void): void
	open(): void
	close(): void
	send(msg: { address: string; args: any[] }, host: string, port: number): void
}

const resolume = await isResolumeReachable()
const hasMedia = resolume && (await testClipHasMedia())

let rest: ArenaRestApi
let oscApi: ArenaOscApi
let udp: OscUDPPort

beforeAll(async () => {
	if (!resolume) return

	rest = new ArenaRestApi(TEST_HOST, REST_PORT)

	udp = new osc.UDPPort({ localAddress: '0.0.0.0', localPort: 0, metadata: true })
	await new Promise<void>((resolve) => {
		udp.on('ready', resolve)
		udp.open()
	})

	oscApi = new ArenaOscApi(TEST_HOST, OSC_SEND_PORT, (host, port, path, args) => {
		udp.send({ address: path, args: Array.isArray(args) ? args : [args] }, host, port)
	})

	await rest.Layers.clear(TEST_LAYER)
	await pause(300)
})

afterAll(() => {
	if (!resolume) return
	try { udp.close() } catch (_) {}
})

// ── 2.3 OSC trigger + verify via REST ────────────────────────────────────────

describe.skipIf(!resolume)('OSC — clear all layers via OSC', () => {
	it('clearAllLayers → REST confirms no connected clips', async () => {
		oscApi.clearAllLayers()
		await pause(500)
		const layer = await rest.Layers.getSettings(TEST_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(false)
	})
})

describe.skipIf(!resolume || !hasMedia)('OSC — trigger column (requires media in TEST slot)', () => {
	it('triggerColumn → REST confirms a clip is Connected', async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(600)
		const layer = await rest.Layers.getSettings(TEST_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})

	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})
})

describe.skipIf(!resolume)('OSC — bypass layer and verify via REST', () => {
	afterAll(async () => {
		oscApi.bypassLayer(TEST_LAYER, { type: 'i', value: 0 })
		await pause(300)
	})

	it('bypasses layer via OSC and REST confirms bypassed = true', async () => {
		oscApi.bypassLayer(TEST_LAYER, { type: 'i', value: 1 })
		await pause(400)
		const layer = (await rest.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.bypassed?.value).toBe(true)
	})

	it('unbypasses layer via OSC and REST confirms bypassed = false', async () => {
		oscApi.bypassLayer(TEST_LAYER, { type: 'i', value: 0 })
		await pause(400)
		const layer = (await rest.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.bypassed?.value).toBe(false)
	})
})

describe.skipIf(!resolume || !hasMedia)('OSC — clip speed (requires media in TEST slot)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connectClip + set speed → transport.controls.speed is defined', async () => {
		oscApi.connectClip(TEST_LAYER, TEST_COLUMN)
		await pause(600)

		const path = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/speed`
		oscApi.send(path, { type: 'f', value: 1.0 })
		await pause(400)

		const clip = await rest.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(clip.transport?.controls?.speed?.value).toBeDefined()
	})
})

describe.skipIf(!resolume)('OSC — tempo tap', () => {
	it('sends tempo tap without throwing', async () => {
		oscApi.tempoTap()
		await pause(200)
		// No assertion — just verify it doesn't throw
	})
})
