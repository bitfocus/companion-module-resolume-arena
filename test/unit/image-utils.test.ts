import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drawThumb, drawPercentage, drawVolume, encodeImageBuffer } from '../../src/image-utils.js'
import { compositionState } from '../../src/state.js'
import { PNG } from 'pngjs'

// 4×4 grey RGBA PNG encoded as base64
const TINY_PNG_B64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGUlEQVR4AWNsAAIGJMDEgAaYGNAAEwMaAACEVAIIK43mlwAAAABJRU5ErkJggg=='

function makeCompositionState(width = 1920, height = 1080) {
	return {
		video: {
			width: { value: width },
			height: { value: height },
		},
	} as any
}

// Module API 2.x requires feedback image buffers to be base64 encoded strings
const decodedLength = (imageBuffer: string | undefined) => Buffer.from(imageBuffer ?? '', 'base64').length
const isBase64 = (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(value)

beforeEach(() => {
	compositionState.set(undefined)
})

describe('encodeImageBuffer', () => {
	it('encodes the bytes as base64', () => {
		expect(encodeImageBuffer(new Uint8Array([0, 1, 2, 253, 254, 255]))).toBe(Buffer.from([0, 1, 2, 253, 254, 255]).toString('base64'))
	})

	it('only encodes the bytes of the view, not the whole underlying ArrayBuffer', () => {
		const backing = new Uint8Array([9, 9, 1, 2, 3, 9])
		const view = new Uint8Array(backing.buffer, 2, 3)
		expect(Buffer.from(encodeImageBuffer(view), 'base64')).toEqual(Buffer.from([1, 2, 3]))
	})
})

describe('drawThumb', () => {
	const decode = (png64: string) => PNG.sync.read(Buffer.from(png64, 'base64'))
	const alphaAt = (png: PNG, x: number, y: number) => png.data[(y * png.width + x) * 4 + 3]

	// Companion 5 draws a png64 image below the button text and an image buffer above it,
	// so the cropped thumbnail has to be a PNG for the text to stay in front of it.
	it('returns a base64 encoded PNG', () => {
		compositionState.set(makeCompositionState())
		const result = drawThumb(TINY_PNG_B64)
		expect(isBase64(result)).toBe(true)
		expect(Buffer.from(result, 'base64').subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
	})

	it('is a 72×72 image: the 64×64 thumbnail with a 4 pixel margin', () => {
		compositionState.set(makeCompositionState())
		const png = decode(drawThumb(TINY_PNG_B64))
		expect(png.width).toBe(72)
		expect(png.height).toBe(72)
	})

	it('keeps the margin transparent so the feedback background colour shows as a border', () => {
		compositionState.set(makeCompositionState())
		const png = decode(drawThumb(TINY_PNG_B64))
		for (const [x, y] of [[0, 0], [3, 3], [71, 71], [68, 36], [36, 3]]) {
			expect(alphaAt(png, x, y), `margin pixel ${x},${y}`).toBe(0)
		}
		// the fixture is a half transparent grey; the thumbnail keeps the alpha of its source
		const sourceAlpha = alphaAt(PNG.sync.read(Buffer.from(TINY_PNG_B64, 'base64')), 0, 0)
		expect(sourceAlpha).toBeGreaterThan(0)
		for (const [x, y] of [[4, 4], [36, 36], [67, 67]]) {
			expect(alphaAt(png, x, y), `thumbnail pixel ${x},${y}`).toBe(sourceAlpha)
		}
	})

	it('handles non-square source aspect ratios without throwing', () => {
		compositionState.set(makeCompositionState(1920, 1080))
		expect(() => drawThumb(TINY_PNG_B64)).not.toThrow()
	})

	it('handles square source aspect ratios without throwing', () => {
		compositionState.set(makeCompositionState(512, 512))
		expect(() => drawThumb(TINY_PNG_B64)).not.toThrow()
	})
})

describe('drawPercentage', () => {
	it('returns a base64 string holding a 72×72 4-channel image', () => {
		const result = drawPercentage(0.5)
		expect(isBase64(result)).toBe(true)
		expect(decodedLength(result)).toBe(72 * 72 * 4)
	})

	it('does not throw for 0 or 1', () => {
		expect(() => drawPercentage(0)).not.toThrow()
		expect(() => drawPercentage(1)).not.toThrow()
	})

	it('does not throw for values above 1 (overflow path)', () => {
		expect(() => drawPercentage(1.5)).not.toThrow()
	})
})

describe('drawVolume', () => {
	it('returns a base64 string holding a 72×72 4-channel image', () => {
		const result = drawVolume(-6)
		expect(isBase64(result)).toBe(true)
		expect(decodedLength(result)).toBe(72 * 72 * 4)
	})

	it('handles 0 dB without throwing', () => {
		expect(() => drawVolume(0)).not.toThrow()
	})

	it('handles large negative values without throwing', () => {
		expect(() => drawVolume(-60)).not.toThrow()
	})
})
