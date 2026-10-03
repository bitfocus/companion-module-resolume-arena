import { describe, it, expect } from 'vitest'
import { toVariableDefinitions } from '../../src/variables/variable-definition.js'
import { getApiVariables } from '../../src/api-variables.js'
import { getAllWsVariables } from '../../src/variables/ws-variables.js'
import { getAllOscVariables } from '../../src/variables/osc-variables.js'

describe('toVariableDefinitions', () => {
	it('converts entries to an object keyed by variable id', () => {
		expect(
			toVariableDefinitions([
				{ variableId: 'a', name: 'Variable A' },
				{ variableId: 'b', name: 'Variable B' },
			])
		).toEqual({
			a: { name: 'Variable A' },
			b: { name: 'Variable B' },
		})
	})

	it('returns an empty object for no entries', () => {
		expect(toVariableDefinitions([])).toEqual({})
	})

	it('does not leak the variableId into the definition', () => {
		const definitions = toVariableDefinitions([{ variableId: 'a', name: 'Variable A' }])
		expect(definitions.a).not.toHaveProperty('variableId')
	})

	it('keeps every variable the module registers (no id collisions)', () => {
		const entries = [...getApiVariables(), ...getAllWsVariables(), ...getAllOscVariables(new Set([11]))]
		const definitions = toVariableDefinitions(entries)
		expect(Object.keys(definitions)).toHaveLength(entries.length)
		expect(definitions.selectedClip).toEqual({ name: 'selectedClip' })
		expect(definitions.osc_layer_11_elapsed).toEqual({ name: 'OSC Layer 11 / Elapsed Time' })
	})
})
