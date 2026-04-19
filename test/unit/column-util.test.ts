import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ColumnUtils } from '../../src/domain/columns/column-util'
import { parameterStates, compositionState } from '../../src/state'

function makeMockModule() {
	const wsApi = {
		subscribePath: vi.fn(),
		unsubscribePath: vi.fn(),
	}
	const instance = {
		checkFeedbacks: vi.fn(),
		setVariableValues: vi.fn(),
		log: vi.fn(),
		getWebsocketApi: vi.fn().mockReturnValue(wsApi),
		_wsApi: wsApi,
	}
	return instance as any
}

function makeContext(resolved: string) {
	return { parseVariablesInString: vi.fn().mockResolvedValue(resolved) } as any
}

function makeFeedback(opts: Record<string, any>) {
	return { id: 'fb1', options: opts } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── messageUpdates ─────────────────────────────────────────────────────────────

describe('ColumnUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("columnName") on name path', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu.messageUpdates({ path: '/composition/columns/1/name', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('columnName')
	})

	it('calls checkFeedbacks("columnConnected") on connect path', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu.messageUpdates({ path: '/composition/columns/2/connect', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('columnConnected')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('connectedColumnName')
	})

	it('calls checkFeedbacks("columnSelected") on select path', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu.messageUpdates({ path: '/composition/columns/1/select', value: false }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('columnSelected')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('selectedColumnName')
	})

	it('does not crash for unrelated paths', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu.messageUpdates({ path: '/composition/tempo', value: false }, false)
		expect(mod.checkFeedbacks).not.toHaveBeenCalled()
	})
})

// ── initConnectedFromComposition ──────────────────────────────────────────────

describe('ColumnUtils.initConnectedFromComposition', () => {
	it('sets selectedColumn from composition state', () => {
		const mod = makeMockModule()
		compositionState.set({
			columns: [
				{ selected: { value: false }, connected: { value: 'Disconnected' }, name: { value: 'Col 1' } },
				{ selected: { value: true }, connected: { value: 'Disconnected' }, name: { value: 'Col 2' } },
			],
		} as any)
		const cu = new ColumnUtils(mod)
		cu.initConnectedFromComposition()
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/columns/1/select')
		expect(mod._wsApi.subscribePath).toHaveBeenCalledWith('/composition/columns/2/select')
	})
})

// ── columnSelectedFeedbackCallback ───────────────────────────────────────────

describe('ColumnUtils.columnSelectedFeedbackCallback', () => {
	it('returns true when column is selected', async () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		parameterStates.set({ '/composition/columns/3/select': { value: true } } as any)
		const result = await cu.columnSelectedFeedbackCallback(makeFeedback({ column: '3' }), makeContext('3'))
		expect(result).toBe(true)
	})

	it('returns falsy when column is not selected', async () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		const result = await cu.columnSelectedFeedbackCallback(makeFeedback({ column: '1' }), makeContext('1'))
		expect(result).toBeFalsy()
	})
})

// ── columnConnectedFeedbackCallback ──────────────────────────────────────────

describe('ColumnUtils.columnConnectedFeedbackCallback', () => {
	it('returns true when column is Connected', async () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		parameterStates.set({ '/composition/columns/2/connect': { value: 'Connected' } } as any)
		const result = await cu.columnConnectedFeedbackCallback(makeFeedback({ column: '2' }), makeContext('2'))
		expect(result).toBe(true)
	})

	it('returns false when column is Disconnected', async () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		parameterStates.set({ '/composition/columns/2/connect': { value: 'Disconnected' } } as any)
		const result = await cu.columnConnectedFeedbackCallback(makeFeedback({ column: '2' }), makeContext('2'))
		expect(result).toBe(false)
	})
})

// ── columnNameFeedbackCallback ────────────────────────────────────────────────

describe('ColumnUtils.columnNameFeedbackCallback', () => {
	it('returns name replacing # with column number', async () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		parameterStates.set({ '/composition/columns/2/name': { value: 'Col #' } } as any)
		const result = await cu.columnNameFeedbackCallback(makeFeedback({ column: '2' }), makeContext('2'))
		expect((result as any).text).toBe('Col 2')
	})
})

// ── calculateSelectedNextColumn ───────────────────────────────────────────────

describe('ColumnUtils.calculateSelectedNextColumn', () => {
	it('advances by add amount', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['selectedColumn'] = 2
		cu['lastColumn'] = 4
		expect(cu.calculateSelectedNextColumn(1)).toBe(3)
	})

	it('wraps around when past last column', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['selectedColumn'] = 4
		cu['lastColumn'] = 4
		expect(cu.calculateSelectedNextColumn(1)).toBe(1)
	})
})

describe('ColumnUtils.calculateSelectedPreviousColumn', () => {
	it('decrements by subtract amount', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['selectedColumn'] = 3
		cu['lastColumn'] = 4
		expect(cu.calculateSelectedPreviousColumn(1)).toBe(2)
	})

	it('wraps to end when before first', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['selectedColumn'] = 1
		cu['lastColumn'] = 4
		expect(cu.calculateSelectedPreviousColumn(1)).toBe(4)
	})
})

// ── calculateConnectedNextColumn / Prev ───────────────────────────────────────

describe('ColumnUtils.calculateConnectedNextColumn', () => {
	it('advances by add amount', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['connectedColumn'] = 1
		cu['lastColumn'] = 3
		expect(cu.calculateConnectedNextColumn(2)).toBe(3)
	})

	it('wraps around when past last column', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['connectedColumn'] = 3
		cu['lastColumn'] = 3
		expect(cu.calculateConnectedNextColumn(1)).toBe(1)
	})
})

describe('ColumnUtils.calculateConnectedPreviousColumn', () => {
	it('decrements by subtract amount', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['connectedColumn'] = 3
		cu['lastColumn'] = 4
		expect(cu.calculateConnectedPreviousColumn(2)).toBe(1)
	})

	it('wraps to end when before first', () => {
		const mod = makeMockModule()
		const cu = new ColumnUtils(mod)
		cu['connectedColumn'] = 1
		cu['lastColumn'] = 4
		expect(cu.calculateConnectedPreviousColumn(1)).toBe(4)
	})
})
