import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drawThumb, drawPercentage, drawVolume } from '../../src/image-utils'
import { compositionState } from '../../src/state'

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

beforeEach(() => {
	compositionState.set(undefined)
})

describe('drawThumb', () => {
	it('returns a base64 string for a valid base64 PNG', () => {
		compositionState.set(makeCompositionState())
		const result = drawThumb(TINY_PNG_B64)
		expect(typeof result).toBe('string')
		expect(result.length).toBeGreaterThan(0)
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
	it('returns a base64 string', () => {
		const result = drawPercentage(0.5)
		expect(typeof result).toBe('string')
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
	it('returns a base64 string', () => {
		const result = drawVolume(-6)
		expect(typeof result).toBe('string')
	})

	it('handles 0 dB without throwing', () => {
		expect(() => drawVolume(0)).not.toThrow()
	})

	it('handles large negative values without throwing', () => {
		expect(() => drawVolume(-60)).not.toThrow()
	})
})
