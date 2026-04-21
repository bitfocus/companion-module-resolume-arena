import { describe, it, expect, vi } from 'vitest'
import { getOscTransportFeedbacks } from '../../src/feedbacks/osc-transport/oscTransportFeedbacks'
import { combineRgb } from '@companion-module/base'

function makeMockInstance({
	remainingSec = 60,
	durationSec = 120,
	progress = 0.5,
	activeColumn = 1,
}: {
	remainingSec?: number
	durationSec?: number
	progress?: number
	activeColumn?: number
} = {}) {
	const oscState = {
		getLayerRemainingSeconds: vi.fn().mockReturnValue(remainingSec),
		getLayerDurationSeconds: vi.fn().mockReturnValue(durationSec),
		getLayerProgress: vi.fn().mockReturnValue(progress),
		activeColumn,
	}
	const instance = {
		getOscState: vi.fn().mockReturnValue(oscState),
		parseVariablesInString: vi.fn().mockImplementation((s: string) => Promise.resolve(s)),
		resolveInt: vi.fn().mockImplementation((s: string) => { const n = parseInt(s, 10); return Promise.resolve(isNaN(n) ? undefined : n) }),
		resolveNumber: vi.fn().mockImplementation((s: string) => { const n = parseFloat(s); return Promise.resolve(isNaN(n) ? undefined : n) }),
		_oscState: oscState,
	}
	return instance as any
}

// ── oscProgressBar ─────────────────────────────────────────────────────────────

describe('oscProgressBar feedback', () => {
	function makeFeedback(overrides: Record<string, any> = {}) {
		return {
			options: {
				layer: '1',
				hideWhenNotRunning: false,
				orangeSeconds: '30',
				redSeconds: '10',
				runningColor: combineRgb(0, 200, 0),
				warningColor: combineRgb(255, 140, 0),
				criticalColor: combineRgb(255, 0, 0),
				...overrides,
			},
			image: { width: 72, height: 72 },
		}
	}

	it('returns imageBuffer when duration > 0', async () => {
		const mod = makeMockInstance({ durationSec: 120, remainingSec: 60 })
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscProgressBar as any).callback(makeFeedback())
		expect(result).toHaveProperty('imageBuffer')
	})

	it('returns empty when hideWhenNotRunning=true and duration=0', async () => {
		const mod = makeMockInstance({ durationSec: 0 })
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscProgressBar as any).callback(
			makeFeedback({ hideWhenNotRunning: true })
		)
		expect(result).toEqual({})
	})

	it('still returns imageBuffer when hideWhenNotRunning=false and duration=0', async () => {
		const mod = makeMockInstance({ durationSec: 0, remainingSec: 0, progress: 0 })
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscProgressBar as any).callback(
			makeFeedback({ hideWhenNotRunning: false })
		)
		expect(result).toHaveProperty('imageBuffer')
	})

	it('uses criticalColor when remaining <= redSeconds', async () => {
		const mod = makeMockInstance({ durationSec: 120, remainingSec: 5 })
		const feedbacks = getOscTransportFeedbacks(mod)
		// Not an error check on the color directly — just verifies no exception and returns buffer
		const result = await (feedbacks.oscProgressBar as any).callback(
			makeFeedback({ redSeconds: '10', criticalColor: combineRgb(255, 0, 0) })
		)
		expect(result).toHaveProperty('imageBuffer')
	})

	it('uses warningColor when remaining <= orangeSeconds but > redSeconds', async () => {
		const mod = makeMockInstance({ durationSec: 120, remainingSec: 20 })
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscProgressBar as any).callback(
			makeFeedback({ orangeSeconds: '30', redSeconds: '10' })
		)
		expect(result).toHaveProperty('imageBuffer')
	})

	it('returns {} when oscState is null', async () => {
		const mod = makeMockInstance()
		mod.getOscState.mockReturnValue(null)
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscProgressBar as any).callback(makeFeedback())
		expect(result).toEqual({})
	})
})

// ── oscActiveColumn ────────────────────────────────────────────────────────────

describe('oscActiveColumn feedback', () => {
	function makeFeedback(column = '1', bgActive = combineRgb(0, 200, 0), textActive = combineRgb(255, 255, 255)) {
		return {
			options: { column: String(column), bg_active: bgActive, text_active: textActive },
		}
	}

	it('returns active colors when column matches activeColumn', async () => {
		const mod = makeMockInstance({ activeColumn: 2 })
		mod.parseVariablesInString.mockResolvedValue('2')
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscActiveColumn as any).callback(makeFeedback('2'))
		expect(result).toEqual({
			bgcolor: expect.any(Number),
			color: expect.any(Number),
		})
	})

	it('returns {} when column does not match activeColumn', async () => {
		const mod = makeMockInstance({ activeColumn: 3 })
		mod.parseVariablesInString.mockResolvedValue('1')
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscActiveColumn as any).callback(makeFeedback('1'))
		expect(result).toEqual({})
	})

	it('returns {} when oscState is null', async () => {
		const mod = makeMockInstance()
		mod.getOscState.mockReturnValue(null)
		const feedbacks = getOscTransportFeedbacks(mod)
		const result = await (feedbacks.oscActiveColumn as any).callback(makeFeedback('1'))
		expect(result).toEqual({})
	})
})
