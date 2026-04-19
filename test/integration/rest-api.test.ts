import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)

// ── 2.1 REST read operations ──────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — product info', () => {
	it('returns product info with name and version fields', async () => {
		const info = await api.productInfo()
		expect(info).toMatchObject({
			name: expect.any(String),
			major: expect.any(Number),
			minor: expect.any(Number),
		})
	})
})

describe.skipIf(!resolume)('REST read — composition layer', () => {
	it('returns layer object with clips array', async () => {
		const layer = await api.Layers.getSettings(TEST_LAYER)
		expect(layer).toHaveProperty('clips')
		expect(Array.isArray(layer.clips)).toBe(true)
	})
})

describe.skipIf(!resolume)('REST read — clip status', () => {
	it('returns clip with id and connected field', async () => {
		const clip = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(clip).toHaveProperty('id')
		expect(clip).toHaveProperty('connected')
		expect(clip.connected).toHaveProperty('value')
		expect(typeof clip.connected.value).toBe('string')
	})
})

describe.skipIf(!resolume)('REST read — layer audio structure', () => {
	it('layer audio.volume field is a number when audio is present', async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.audio?.volume != null) {
			expect(typeof layer.audio.volume.value).toBe('number')
		}
	})
})

// ── 2.2 REST write operations ─────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — POST connect endpoint', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('POST to connect endpoint does not throw regardless of clip state', async () => {
		await expect(api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))).resolves.not.toThrow()
	})
})

describe.skipIf(!resolume)('REST write — connect + clear with media (requires media in TEST slot)', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	it('clip is Connected after POST connect', async () => {
		const clip = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(clip.connected.value).toBe('Connected')
	})

	it('no clip is Connected after layer clear', async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(400)
		const layer = await api.Layers.getSettings(TEST_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(false)
	})
})

describe.skipIf(!resolume)('REST write — layer video opacity', () => {
	let originalOpacity: number

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalOpacity = layer?.video?.opacity?.value ?? 1
	})

	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: originalOpacity } } } as any)
	})

	it('sets opacity to 0.5 and REST confirms the new value', async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: 0.5 } } } as any)
		await pause(200)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.video?.opacity?.value).toBeCloseTo(0.5, 2)
	})
})
