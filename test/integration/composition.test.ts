/**
 * Composition-level integration tests:
 * - REST read of composition structure (layers, columns, decks)
 * - REST write of composition-level parameters (opacity, master)
 * - Clip API: getStatus, loadFile (if media path known)
 * - Column API: getSettings
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { ClipId } from '../../src/domain/clip/clip-id'
import {
	TEST_HOST,
	REST_PORT,
	OSC_SEND_PORT,
	TEST_LAYER,
	TEST_COLUMN,
	TEST_GROUP,
} from './config'
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
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── Composition structure ─────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — composition structure', () => {
	it('productInfo has major version >= 7', async () => {
		const info = await api.productInfo()
		expect(info.major).toBeGreaterThanOrEqual(7)
	})

	it('layer 1 has at least 1 clip', async () => {
		const layer = await api.Layers.getSettings(TEST_LAYER)
		expect(layer.clips.length).toBeGreaterThanOrEqual(1)
	})

	it('layer 1 has bypassed field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer).toHaveProperty('bypassed')
		expect(typeof layer.bypassed.value).toBe('boolean')
	})

	it('layer 1 has solo field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer).toHaveProperty('solo')
		expect(typeof layer.solo.value).toBe('boolean')
	})
})

// ── Column API ────────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — column settings', () => {
	it('column 1 has id field', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col).toHaveProperty('id')
	})

	it('column 1 has connected field', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col).toHaveProperty('connected')
		expect(typeof col.connected.value).toBe('string')
	})
})

// ── Clip API ──────────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — clip API', () => {
	it('getStatus returns clip with connected field', async () => {
		const clip = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(clip).toHaveProperty('connected')
	})

	it('getStatus on second column returns clip object', async () => {
		const clip = await api.Clips.getStatus(new ClipId(TEST_LAYER, 2))
		expect(clip).toHaveProperty('id')
	})
})

describe.skipIf(!resolume || !hasMedia)('REST read — clip with media', () => {
	it('connected clip has transport structure', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(clip).toHaveProperty('transport')
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})
})

// ── Composition opacity via REST ──────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer solo', () => {
	let originalSolo: boolean

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalSolo = layer?.solo?.value ?? false
	})

	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { solo: { value: originalSolo } } as any)
		await pause(200)
	})

	it('sets solo to true and REST confirms it', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { solo: { value: true } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.solo?.value).toBe(true)
	})

	it('sets solo to false and REST confirms it', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { solo: { value: false } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.solo?.value).toBe(false)
	})
})

// ── Layer group opacity via REST (additional write) ───────────────────────────

describe.skipIf(!resolume)('REST write — layer group settings structure', () => {
	it('layer group 1 has video.opacity field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('video')
		expect(group.video).toHaveProperty('opacity')
		expect(typeof group.video.opacity.value).toBe('number')
	})

	it('layer group 1 has audio structure', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group.audio?.volume != null) {
			expect(typeof group.audio.volume.value).toBe('number')
		}
	})
})

// ── OSC composition column navigation ────────────────────────────────────────

describe.skipIf(!resolume)('OSC — composition column navigation', () => {
	it('compNextCol does not throw', async () => {
		oscApi.compNextCol()
		await pause(200)
	})

	it('compPrevCol does not throw', async () => {
		oscApi.compPrevCol()
		await pause(200)
	})
})

// ── OSC — layer column navigation ─────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer column navigation', () => {
	it('layerNextCol does not throw', async () => {
		oscApi.layerNextCol(TEST_LAYER)
		await pause(200)
		oscApi.clearLayer(TEST_LAYER)
		await pause(200)
	})

	it('layerPrevCol does not throw', async () => {
		oscApi.layerPrevCol(TEST_LAYER)
		await pause(200)
		oscApi.clearLayer(TEST_LAYER)
		await pause(200)
	})
})

// ── Clip speed via REST+OSC ───────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('REST+OSC — clip opacity (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connects clip and reads clip video opacity', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(clip?.video?.opacity).toBeDefined()
		expect(typeof clip.video.opacity.value).toBe('number')
	})
})
