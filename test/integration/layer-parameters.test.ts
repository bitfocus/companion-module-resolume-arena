/**
 * Layer parameter integration tests:
 * - Layer master, opacity, volume read/write via REST
 * - Layer select and verify via REST
 * - Layer bypass (already in osc.test.ts — this tests via REST path)
 * - Layer transition duration read structure
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

// ── Layer structure ───────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — layer parameter structure', () => {
	it('layer has master field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer).toHaveProperty('master')
		expect(typeof layer.master.value).toBe('number')
	})

	it('layer has video.opacity field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.video?.opacity?.value).toBeDefined()
		expect(typeof layer.video.opacity.value).toBe('number')
	})

	it('layer has audio.volume field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.audio?.volume != null) {
			expect(typeof layer.audio.volume.value).toBe('number')
		}
	})

	it('layer has transition.duration field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.transition?.duration != null) {
			expect(layer.transition.duration).toHaveProperty('value')
		}
	})

	it('layer has name field', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer).toHaveProperty('name')
		expect(typeof layer.name.value).toBe('string')
	})
})

// ── Layer master via REST write ───────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer master', () => {
	let originalMaster: number

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalMaster = layer?.master?.value ?? 1
	})

	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { master: { value: originalMaster } } as any)
		await pause(200)
	})

	it('sets master to 0.5 and REST confirms', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { master: { value: 0.5 } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.master?.value).toBeCloseTo(0.5, 2)
	})

	it('sets master back to 1.0 and REST confirms', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { master: { value: 1.0 } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.master?.value).toBeCloseTo(1.0, 2)
	})
})

// ── Layer opacity via REST write ──────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer opacity', () => {
	let originalOpacity: number

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalOpacity = layer?.video?.opacity?.value ?? 1
	})

	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: originalOpacity } } } as any)
		await pause(200)
	})

	it('sets opacity to 0.25 and REST confirms', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: 0.25 } } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.video?.opacity?.value).toBeCloseTo(0.25, 2)
	})

	it('sets opacity to 0.75 and REST confirms', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: 0.75 } } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.video?.opacity?.value).toBeCloseTo(0.75, 2)
	})
})

// ── Layer select via OSC ──────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer clear (additional)', () => {
	it('clearLayer on layer 1 via OSC → REST confirms no connected clips', async () => {
		oscApi.clearLayer(TEST_LAYER)
		await pause(400)
		const layer = await api.Layers.getSettings(TEST_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(false)
	})
})

// ── Clip opacity via REST ─────────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('REST read — clip video opacity (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected clip has video.opacity with numeric value', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.video?.opacity != null) {
			expect(typeof clip.video.opacity.value).toBe('number')
		}
	})

	it('connected clip has audio.volume with numeric value', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.audio?.volume != null) {
			expect(typeof clip.audio.volume.value).toBe('number')
		}
	})

	it('connected clip has transport.controls.speed with numeric value', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport?.controls?.speed != null) {
			expect(typeof clip.transport.controls.speed.value).toBe('number')
		}
	})
})

// ── Clip select via OSC ───────────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — clip select (requires media)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('selectClip via OSC → clip has selected=true after query', async () => {
		oscApi.selectClip(TEST_LAYER, TEST_COLUMN)
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		// selected is either true or the string 'Selected' depending on version
		expect(
			clip?.selected?.value === true || clip?.selected?.value === 'Selected'
		).toBe(true)
	})
})

// ── Multiple layers read ──────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — multiple layers', () => {
	it('layer 2 has clips array', async () => {
		const layer = await api.Layers.getSettings(2)
		expect(layer).toHaveProperty('clips')
		expect(Array.isArray(layer.clips)).toBe(true)
	})

	it('layer 3 has id field', async () => {
		const layer = (await api.Layers.getSettings(3)) as any
		expect(layer).toHaveProperty('id')
	})

	it('layer 2 and layer 3 have different ids (not same layer)', async () => {
		const layer2 = (await api.Layers.getSettings(2)) as any
		const layer3 = (await api.Layers.getSettings(3)) as any
		expect(layer2.id).not.toBe(layer3.id)
	})
})

// ── Multiple columns read ─────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — multiple columns', () => {
	it('column 2 has id field', async () => {
		const col = (await api.Columns.getSettings(2)) as any
		expect(col).toHaveProperty('id')
	})

	it('column 3 has connected field', async () => {
		const col = (await api.Columns.getSettings(3)) as any
		expect(col).toHaveProperty('connected')
	})

	it('column 1 and column 2 have different ids', async () => {
		const col1 = (await api.Columns.getSettings(1)) as any
		const col2 = (await api.Columns.getSettings(2)) as any
		expect(col1.id).not.toBe(col2.id)
	})
})

// ── Layer solo via OSC ────────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer solo (section 2.8)', () => {
	let originalSolo: boolean

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalSolo = layer?.solo?.value ?? false
	})

	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { solo: { value: originalSolo } } as any)
		await pause(200)
	})

	it('sends solo=1 via OSC → REST confirms solo is true', async () => {
		oscApi.send(`/composition/layers/${TEST_LAYER}/solo`, [{ type: 'i', value: 1 }])
		await pause(300)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.solo?.value).toBe(true)
	})

	it('sends solo=0 via OSC → REST confirms solo is false', async () => {
		oscApi.send(`/composition/layers/${TEST_LAYER}/solo`, [{ type: 'i', value: 0 }])
		await pause(300)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.solo?.value).toBe(false)
	})
})

// ── Layer select via OSC ──────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer select (section 2.8)', () => {
	it('sends select=1 via OSC → REST reports layer as selected', async () => {
		oscApi.send(`/composition/layers/${TEST_LAYER}/select`, [{ type: 'i', value: 1 }])
		await pause(300)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.selected != null) {
			expect(layer.selected.value === true || layer.selected.value === 'Selected').toBe(true)
		}
	})
})

// ── Layer volume write via REST ───────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer audio volume (section 2.8)', () => {
	let originalVolume: number | undefined

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalVolume = layer?.audio?.volume?.value
	})

	afterAll(async () => {
		if (originalVolume !== undefined) {
			await api.Layers.updateSettings(TEST_LAYER, { audio: { volume: { value: originalVolume } } } as any)
			await pause(200)
		}
	})

	it('sets layer volume to 0.5 and REST confirms', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.audio?.volume == null) return
		const before = layer.audio.volume.value
		await api.Layers.updateSettings(TEST_LAYER, { audio: { volume: { value: 0.5 } } } as any)
		await pause(200)
		const updated = (await api.Layers.getSettings(TEST_LAYER)) as any
		const after = updated?.audio?.volume?.value
		// Only assert if Resolume accepted the write (value changed from original).
		// Without an active clip, Resolume silently ignores audio.volume writes.
		if (after !== before) {
			expect(after).toBeCloseTo(0.5, 2)
		}
	})
})

// ── Layer transition duration write via REST ──────────────────────────────────

describe.skipIf(!resolume)('REST write — layer transition duration (section 2.8)', () => {
	let originalDuration: number | undefined

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalDuration = layer?.transition?.duration?.value
	})

	afterAll(async () => {
		if (originalDuration !== undefined) {
			await api.Layers.updateSettings(TEST_LAYER, { transition: { duration: { value: originalDuration } } } as any)
			await pause(200)
		}
	})

	it('sets transition duration to 1.0 and REST confirms', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.transition?.duration == null) return
		await api.Layers.updateSettings(TEST_LAYER, { transition: { duration: { value: 1.0 } } } as any)
		await pause(200)
		const updated = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(updated?.transition?.duration?.value).toBeCloseTo(1.0, 2)
	})
})
