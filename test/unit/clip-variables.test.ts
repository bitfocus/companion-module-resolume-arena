import { describe, it, expect } from 'vitest'
import { getClipApiVariables } from '../../src/variables/clip/clipVariables'

describe('getClipApiVariables', () => {
	it('returns 8 variable definitions', () => {
		expect(getClipApiVariables()).toHaveLength(8)
	})

	it('includes selectedClip variables', () => {
		const ids = getClipApiVariables().map((v) => v.variableId)
		expect(ids).toContain('selectedClip')
		expect(ids).toContain('selectedClipLayer')
		expect(ids).toContain('selectedClipColumn')
		expect(ids).toContain('selectedClipName')
	})

	it('includes previewedClip variables', () => {
		const ids = getClipApiVariables().map((v) => v.variableId)
		expect(ids).toContain('previewedClip')
		expect(ids).toContain('previewedClipLayer')
		expect(ids).toContain('previewedClipColumn')
		expect(ids).toContain('previewedClipName')
	})
})
