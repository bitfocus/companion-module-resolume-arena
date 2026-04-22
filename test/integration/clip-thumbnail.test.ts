/**
 * Clip thumbnail and clear integration tests:
 * - Clips.getThumb() returns base64 image data for a clip with media
 * - Clips.clear() disconnects a connected clip via REST
 * - drawThumb() can process a live thumbnail returned by Resolume
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'
import { drawThumb } from '../../src/image-utils'
import { compositionState } from '../../src/state'

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

	it('drawThumb returns a Uint8Array from a live Resolume thumbnail', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(thumb.length).toBeGreaterThan(0)
		const result = drawThumb(thumb)
		expect(result).toBeInstanceOf(Uint8Array)
	})

	it('drawThumb output is exactly 64×64 RGB (12288 bytes)', async () => {
		const thumb = await api.Clips.getThumb(new ClipId(TEST_LAYER, TEST_COLUMN))
		const result = drawThumb(thumb)
		expect(result.length).toBe(64 * 64 * 3)
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


