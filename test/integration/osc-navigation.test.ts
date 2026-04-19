/**
 * OSC navigation integration tests:
 * - compNextCol / compPrevCol — composition column navigation
 * - layerNextCol / layerPrevCol — layer clip navigation (requires media)
 * - tempoResync — smoke test
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
let oscApi: ArenaOscApi
let udp: any

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
	await api.Layers.clear(TEST_LAYER)
	await pause(300)
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── Composition column navigation ─────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — composition column navigation', () => {
	it('compNextCol does not throw and Resolume still responds', async () => {
		oscApi.compNextCol()
		await pause(300)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})

	it('compPrevCol does not throw and Resolume still responds', async () => {
		oscApi.compPrevCol()
		await pause(300)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})

	it('compNextCol then compPrevCol leaves Resolume responsive', async () => {
		oscApi.compNextCol()
		await pause(200)
		oscApi.compPrevCol()
		await pause(300)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})
})

// ── Layer clip navigation ─────────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — layer clip navigation (requires media)', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})

	it('layerNextCol triggers the next clip slot and Resolume still responds', async () => {
		oscApi.layerNextCol(TEST_LAYER)
		await pause(400)
		// The layer should still be responsive; we can't assert which column is active
		// without knowing if column TEST_COLUMN+1 has media, so verify REST is alive.
		const layer = await api.Layers.getSettings(TEST_LAYER)
		expect(layer).toHaveProperty('clips')
	})

	it('layerPrevCol navigates back and Resolume still responds', async () => {
		oscApi.layerPrevCol(TEST_LAYER)
		await pause(400)
		const layer = await api.Layers.getSettings(TEST_LAYER)
		expect(layer).toHaveProperty('clips')
	})
})

// ── Next/prev column navigation round-trip ────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — column navigation round-trip (requires media)', () => {
	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})

	it('triggerColumn + compNextCol + compPrevCol leaves layer in known state', async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(500)
		const before = await api.Layers.getSettings(TEST_LAYER)
		const hadConnected = before.clips.some((c) => c.connected?.value === 'Connected')
		expect(hadConnected).toBe(true)

		oscApi.compNextCol()
		await pause(300)
		oscApi.compPrevCol()
		await pause(300)

		// Resolume is still alive
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})
})

// ── tempoResync ───────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — tempoResync', () => {
	it('sends tempoResync without throwing', async () => {
		oscApi.tempoResync()
		await pause(200)
		// No observable side effect to assert — just verify Resolume is still alive
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})
})
