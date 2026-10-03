import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drawThumb, drawPercentage, drawVolume, encodeImageBuffer } from '../../src/image-utils.js'
import { compositionState } from '../../src/state.js'

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
	it('returns a base64 string for a valid base64 PNG', () => {
		compositionState.set(makeCompositionState())
		const result = drawThumb(TINY_PNG_B64)
		expect(isBase64(result)).toBe(true)
	})

	it('output length matches 64×64 RGB (64*64*3 = 12288 bytes)', () => {
		compositionState.set(makeCompositionState())
		const result = drawThumb(TINY_PNG_B64)
		expect(decodedLength(result)).toBe(64 * 64 * 3)
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
