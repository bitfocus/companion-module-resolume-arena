/**
 * Clip thumbnail and clear integration tests:
 * - Clips.getThumb() returns base64 image data for a clip with media
 * - Clips.clear() disconnects a connected clip via REST
 * - ClipUtils.refreshThumbnail() fetches and caches the thumbnail
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { ClipUtils } from '../../src/domain/clip/clip-utils'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

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

// ── ClipUtils.refreshThumbnail ────────────────────────────────────────────────

describe.skipIf(!resolume)('ClipUtils.refreshThumbnail (requires media)', () => {
	let clipUtils: ClipUtils

	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)

		const shim: any = {
			log: () => {},
			checkFeedbacks: () => {},
			checkFeedbacksById: () => {},
			setVariableValues: () => {},
			getConfig: () => ({ useCroppedThumbs: false }),
			getWebsocketApi: () => null,
			getClipUtils: () => clipUtils,
			restApi: api,
		}
		clipUtils = new ClipUtils(shim)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('refreshThumbnail populates the base64 thumbnail cache for a connected clip', async () => {
		await clipUtils.refreshThumbnail(TEST_LAYER, TEST_COLUMN)
		const clipId = new ClipId(TEST_LAYER, TEST_COLUMN)
		// Access internal cache via any cast — integration test only
		const cache = (clipUtils as any).clipBase64Thumbs as Map<string, string>
		const thumb = cache.get(clipId.getIdString())
		expect(typeof thumb).toBe('string')
		expect(thumb!.length).toBeGreaterThan(0)
	})

	it('calling refreshThumbnail twice does not throw and updates the cache', async () => {
		await clipUtils.refreshThumbnail(TEST_LAYER, TEST_COLUMN)
		await clipUtils.refreshThumbnail(TEST_LAYER, TEST_COLUMN)
		const clipId = new ClipId(TEST_LAYER, TEST_COLUMN)
		const cache = (clipUtils as any).clipBase64Thumbs as Map<string, string>
		expect(cache.has(clipId.getIdString())).toBe(true)
	})
})
