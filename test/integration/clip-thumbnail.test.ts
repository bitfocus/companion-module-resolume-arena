/**
 * Clip thumbnail and clear integration tests:
 * - Clips.getThumb() returns base64 image data for a clip with media
 * - Clips.clear() disconnects a connected clip via REST
 * - drawThumb() can process a live thumbnail returned by Resolume
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest.js'
import { ClipId } from '../../src/domain/clip/clip-id.js'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config.js'
import { isResolumeReachable, pause } from './helpers.js'
import { drawThumb } from '../../src/image-utils.js'
import { compositionState } from '../../src/state.js'
import { PNG } from 'pngjs'

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)

// ── Clip thumbnail ────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — clip thumbnail (requires media)', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('getThumb returns a non-empty string for a connected clip', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(typeof thumb).toBe('string')
		expect(thumb.length).toBeGreaterThan(0)
	})

	it('getThumb result looks like base64 image data', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		// Base64 uses A–Z a–z 0–9 + / = only
		expect(/^[A-Za-z0-9+/=]+$/.test(thumb)).toBe(true)
	})
})

// ── drawThumb — image-rs pipeline ─────────────────────────────────────────────

describe.skipIf(!resolume)('drawThumb — image-rs pipeline (requires media)', () => {
	beforeAll(async () => {
		compositionState.set({ video: { width: { value: 1920 }, height: { value: 1080 } } } as any)
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		compositionState.set(undefined)
		await pause(300)
	})

	it('drawThumb returns a base64 PNG from a live Resolume thumbnail', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(thumb.length).toBeGreaterThan(0)
		const result = drawThumb(thumb)
		expect(typeof result).toBe('string')
		expect(Buffer.from(result, 'base64').subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
	})

	it('drawThumb output is a 72×72 PNG (64×64 thumbnail with a 4 pixel margin)', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		const png = PNG.sync.read(Buffer.from(drawThumb(thumb), 'base64'))
		expect(png.width).toBe(72)
		expect(png.height).toBe(72)
	})
})

describe.skipIf(!resolume)('REST read — clip thumbnail for empty clip', () => {
	beforeAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('getThumb returns a string (possibly empty) for a disconnected clip', async () => {
		// Resolume may return an empty placeholder thumbnail — the API should not throw
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(typeof thumb).toBe('string')
	})
})


