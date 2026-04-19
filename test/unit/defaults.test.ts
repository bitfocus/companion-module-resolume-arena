import { describe, it, expect } from 'vitest'
import { getSpeedValue, getDeckOption, getLayerOption, getColumnOption, getClipOption, getLayerGroupOption } from '../../src/defaults'

// getSpeedValue maps a percentage input to Resolume's internal speed scale.
// 100% → ~4.0 (Resolume's "normal speed" value on the OSC interface).
// Formula: Math.pow(inputValue / 10, Math.log(4) / Math.log(10))
describe('getSpeedValue', () => {
	it('0 maps to 0', () => {
		expect(getSpeedValue(0)).toBe(0)
	})

	it('100 maps to ~4.0 (normal speed in Resolume OSC scale)', () => {
		expect(getSpeedValue(100)).toBeCloseTo(4.0, 3)
	})

	it('output increases monotonically with input', () => {
		const inputs = [10, 50, 100, 150, 200]
		const values = inputs.map(getSpeedValue)
		for (let i = 1; i < values.length; i++) {
			expect(values[i]).toBeGreaterThan(values[i - 1])
		}
	})

	it('50 produces a value between 0 and 4 (slower than normal)', () => {
		const v = getSpeedValue(50)
		expect(v).toBeGreaterThan(0)
		expect(v).toBeLessThan(4.0)
	})

	it('200 produces a value greater than 4 (faster than normal)', () => {
		expect(getSpeedValue(200)).toBeGreaterThan(4.0)
	})
})

describe('option builders', () => {
	it('getDeckOption returns a single textinput with id "deck"', () => {
		const opts = getDeckOption()
		expect(opts).toHaveLength(1)
		expect(opts[0].id).toBe('deck')
		expect(opts[0].type).toBe('textinput')
		expect((opts[0] as any).default).toBe('1')
		expect((opts[0] as any).useVariables).toBe(true)
	})

	it('getLayerOption returns a single textinput with id "layer"', () => {
		const opts = getLayerOption()
		expect(opts).toHaveLength(1)
		expect(opts[0].id).toBe('layer')
		expect(opts[0].type).toBe('textinput')
		expect((opts[0] as any).default).toBe('1')
		expect((opts[0] as any).useVariables).toBe(true)
	})

	it('getColumnOption returns a single textinput with id "column"', () => {
		const opts = getColumnOption()
		expect(opts).toHaveLength(1)
		expect(opts[0].id).toBe('column')
		expect(opts[0].type).toBe('textinput')
		expect((opts[0] as any).default).toBe('1')
		expect((opts[0] as any).useVariables).toBe(true)
	})

	it('getClipOption returns layer + column fields', () => {
		const opts = getClipOption()
		expect(opts).toHaveLength(2)
		expect(opts.map((o) => o.id)).toEqual(['layer', 'column'])
	})

	it('getLayerGroupOption returns a single textinput with id "layerGroup"', () => {
		const opts = getLayerGroupOption()
		expect(opts).toHaveLength(1)
		expect(opts[0].id).toBe('layerGroup')
		expect(opts[0].type).toBe('textinput')
		expect((opts[0] as any).default).toBe('1')
		expect((opts[0] as any).useVariables).toBe(true)
	})
})
