import { describe, it, expect } from 'vitest'
import { getOscLayerVariables, getAllOscVariables, OSC_DEFAULT_LAYERS } from '../../src/variables/osc-variables'

describe('getOscLayerVariables', () => {
	it('returns 7 variables per layer', () => {
		expect(getOscLayerVariables(1)).toHaveLength(7)
	})

	it('prefixes all variableIds with osc_layer_<n>', () => {
		const vars = getOscLayerVariables(3)
		for (const v of vars) {
			expect(v.variableId).toMatch(/^osc_layer_3_/)
		}
	})

	it('includes elapsed, elapsed_seconds, duration, remaining, remaining_seconds, progress, clip_name', () => {
		const ids = getOscLayerVariables(1).map((v) => v.variableId)
		expect(ids).toContain('osc_layer_1_elapsed')
		expect(ids).toContain('osc_layer_1_elapsed_seconds')
		expect(ids).toContain('osc_layer_1_duration')
		expect(ids).toContain('osc_layer_1_remaining')
		expect(ids).toContain('osc_layer_1_remaining_seconds')
		expect(ids).toContain('osc_layer_1_progress')
		expect(ids).toContain('osc_layer_1_clip_name')
	})
})

describe('getAllOscVariables', () => {
	it('includes composition-level variables', () => {
		const ids = getAllOscVariables(new Set()).map((v) => v.variableId)
		expect(ids).toContain('osc_active_column')
		expect(ids).toContain('osc_active_column_name')
	})

	it('includes variables for all 10 default layers', () => {
		const vars = getAllOscVariables(new Set())
		for (let l = 1; l <= OSC_DEFAULT_LAYERS; l++) {
			const layerIds = vars.map((v) => v.variableId)
			expect(layerIds).toContain(`osc_layer_${l}_elapsed`)
		}
	})

	it('includes extra layers beyond 10', () => {
		const vars = getAllOscVariables(new Set([11, 15]))
		const ids = vars.map((v) => v.variableId)
		expect(ids).toContain('osc_layer_11_elapsed')
		expect(ids).toContain('osc_layer_15_elapsed')
	})

	it('does not duplicate default layers when extra set contains layers <= 10', () => {
		const withExtra = getAllOscVariables(new Set([5, 11]))
		const without = getAllOscVariables(new Set([11]))
		// layer 5 is already in default range — count should be the same
		expect(withExtra.length).toBe(without.length)
	})
})
