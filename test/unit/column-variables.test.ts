import { describe, it, expect } from 'vitest'
import { getColumnApiVariables } from '../../src/variables/column/columnVariables'

describe('getColumnApiVariables', () => {
	it('returns 2 variable definitions', () => {
		expect(getColumnApiVariables()).toHaveLength(2)
	})

	it('includes selectedColumn and connectedColumn', () => {
		const ids = getColumnApiVariables().map((v) => v.variableId)
		expect(ids).toContain('selectedColumn')
		expect(ids).toContain('connectedColumn')
	})
})
