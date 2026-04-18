import { describe, it, expect } from 'vitest'
import { ClipId } from '../../src/domain/clip/clip-id'

describe('ClipId', () => {
	it('stores layer and column', () => {
		const id = new ClipId(3, 7)
		expect(id.getLayer()).toBe(3)
		expect(id.getColumn()).toBe(7)
	})

	it('getIdString returns "layer-column"', () => {
		expect(new ClipId(1, 2).getIdString()).toBe('1-2')
		expect(new ClipId(10, 20).getIdString()).toBe('10-20')
	})

	it('fromId round-trips through getIdString', () => {
		const original = new ClipId(5, 12)
		const parsed = ClipId.fromId(original.getIdString())
		expect(parsed.getLayer()).toBe(5)
		expect(parsed.getColumn()).toBe(12)
	})

	it('equals returns true only for matching layer and column', () => {
		const id = new ClipId(2, 4)
		expect(id.equals(2, 4)).toBe(true)
		expect(id.equals(2, 5)).toBe(false)
		expect(id.equals(3, 4)).toBe(false)
	})

	describe('isValid', () => {
		it('returns true when both are positive integers', () => {
			expect(ClipId.isValid(1, 1)).toBe(true)
			expect(ClipId.isValid(99, 99)).toBe(true)
		})

		it('returns false when layer or column is 0', () => {
			expect(ClipId.isValid(0, 1)).toBe(false)
			expect(ClipId.isValid(1, 0)).toBe(false)
			expect(ClipId.isValid(0, 0)).toBe(false)
		})

		it('returns false when layer or column is undefined', () => {
			expect(ClipId.isValid(undefined, 1)).toBe(false)
			expect(ClipId.isValid(1, undefined)).toBe(false)
			expect(ClipId.isValid(undefined, undefined)).toBe(false)
		})

		it('returns false for negative values', () => {
			expect(ClipId.isValid(-1, 1)).toBe(false)
			expect(ClipId.isValid(1, -1)).toBe(false)
		})
	})
})
