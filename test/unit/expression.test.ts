import { describe, it, expect } from 'vitest'
import { evaluateExpression, resolveExpression, resolveNumber, resolveInt } from '../../src/util/expression'

const identity = async (s: string) => s

describe('evaluateExpression', () => {
	it('evaluates simple arithmetic', () => {
		expect(evaluateExpression('1 + 2')).toBe('3')
		expect(evaluateExpression('10 / 4')).toBe('2.5')
		expect(evaluateExpression('2 ^ 3')).toBe('8')
	})

	it('returns the input unchanged for plain values', () => {
		expect(evaluateExpression('42')).toBe('42')
		expect(evaluateExpression('0.75')).toBe('0.75')
	})

	it('returns the input unchanged for non-numeric strings', () => {
		expect(evaluateExpression('Add')).toBe('Add')
		expect(evaluateExpression('some text')).toBe('some text')
	})

	it('returns the input unchanged for invalid expressions', () => {
		expect(evaluateExpression('1 +')).toBe('1 +')
		expect(evaluateExpression('')).toBe('')
	})
})

describe('resolveExpression', () => {
	it('substitutes variables then evaluates', async () => {
		const sub = async (s: string) => s.replace('$(x)', '3')
		expect(await resolveExpression('$(x) + 2', sub)).toBe('5')
	})

	it('passes through non-expression values after substitution', async () => {
		const sub = async (s: string) => s.replace('$(mode)', 'Add')
		expect(await resolveExpression('$(mode)', sub)).toBe('Add')
	})
})

describe('resolveNumber', () => {
	it('returns a number for numeric input', async () => {
		expect(await resolveNumber('42', identity)).toBe(42)
		expect(await resolveNumber('0.5 + 0.25', identity)).toBe(0.75)
	})

	it('returns undefined for non-numeric input', async () => {
		expect(await resolveNumber('Add', identity)).toBeUndefined()
		expect(await resolveNumber('', identity)).toBeUndefined()
	})
})

describe('resolveInt', () => {
	it('rounds to nearest integer', async () => {
		expect(await resolveInt('2.7', identity)).toBe(3)
		expect(await resolveInt('2.3', identity)).toBe(2)
		expect(await resolveInt('1 + 2', identity)).toBe(3)
	})

	it('returns undefined for non-numeric input', async () => {
		expect(await resolveInt('text', identity)).toBeUndefined()
	})
})
