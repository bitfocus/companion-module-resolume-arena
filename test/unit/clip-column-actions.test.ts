import { describe, it, expect, vi, beforeEach } from 'vitest'
import { connectClip } from '../../src/actions/clip/actions/connect-clip'
import { selectClip } from '../../src/actions/clip/actions/select-clip'
import { connectColumn } from '../../src/actions/column/actions/connectColumn'
import { selectColumn } from '../../src/actions/column/actions/selectColumn'
import { selectDeck } from '../../src/actions/deck/actions/select-deck'
import { compositionState, parameterStates } from '../../src/state'

function makeWsApi() {
	return { setPath: vi.fn(), triggerPath: vi.fn(), subscribeParam: vi.fn(), setParam: vi.fn() }
}

function makeOscApi() {
	return { connectClip: vi.fn(), selectClip: vi.fn() }
}

function makeInstance(...results: string[]) {
	let idx = 0
	return {
		log: vi.fn(),
		parseVariablesInString: vi.fn().mockImplementation(() => Promise.resolve(results[idx++] ?? '1')),
	} as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── connectClip ────────────────────────────────────────────────────────────────

describe('connectClip — REST path', () => {
	it('triggers connect path twice (true then false)', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('2', '3')
		const action = connectClip(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '2', column: '3' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/2/clips/3/connect', true)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/2/clips/3/connect', false)
	})
})

describe('connectClip — OSC path', () => {
	it('calls oscApi.connectClip', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('1', '2')
		const action = connectClip(() => null, () => null, () => osc as any, instance)
		await (action.callback as any)({ options: { layer: '1', column: '2' } })
		expect(osc.connectClip).toHaveBeenCalledWith(1, 2)
	})
})

// ── selectClip ─────────────────────────────────────────────────────────────────

describe('selectClip', () => {
	it('triggers select path true then false via websocket', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('1', '3')
		const action = selectClip(() => ({} as any), () => ws as any, () => null, instance)
		await (action.callback as any)({ options: { layer: '1', column: '3' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/1/clips/3/select', true)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/layers/1/clips/3/select', false)
	})
})

// ── connectColumn ──────────────────────────────────────────────────────────────

describe('connectColumn — REST path', () => {
	it('action=set triggers column connect path with the given value', async () => {
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn(), calculateConnectedPreviousColumn: vi.fn() }
		const instance = makeInstance('2')
		const action = connectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byIndex', action: 'set', value: '2' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/2/connect', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/2/connect', true)
	})

	it('action=add calls calculateConnectedNextColumn', async () => {
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn().mockReturnValue(3), calculateConnectedPreviousColumn: vi.fn() }
		const instance = makeInstance('1')
		const action = connectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byIndex', action: 'add', value: '1' } })
		expect(columnUtils.calculateConnectedNextColumn).toHaveBeenCalledWith(1)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/3/connect', true)
	})

	it('action=subtract calls calculateConnectedPreviousColumn', async () => {
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn(), calculateConnectedPreviousColumn: vi.fn().mockReturnValue(2) }
		const instance = makeInstance('1')
		const action = connectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byIndex', action: 'subtract', value: '1' } })
		expect(columnUtils.calculateConnectedPreviousColumn).toHaveBeenCalledWith(1)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/2/connect', true)
	})

	it('does nothing when restApi is null', async () => {
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn() }
		const action = connectColumn(
			() => null,
			() => ws as any,
			() => null,
			() => columnUtils as any,
			makeInstance()
		)
		await (action.callback as any)({ options: { lookupMode: 'byIndex', action: 'set', value: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

describe('connectColumn — byName lookup', () => {
	it('connects to the column whose name matches', async () => {
		parameterStates.set({
			'/composition/columns/1/name': { value: 'Intro' },
			'/composition/columns/2/name': { value: 'Verse' },
			'/composition/columns/3/name': { value: 'Chorus' },
		} as any)
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn(), calculateConnectedPreviousColumn: vi.fn() }
		const instance = makeInstance('Verse')
		const action = connectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byName', name: 'Verse' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/2/connect', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/2/connect', true)
	})

	it('logs an error and does not trigger when name is not found', async () => {
		parameterStates.set({
			'/composition/columns/1/name': { value: 'Intro' },
		} as any)
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn(), calculateConnectedPreviousColumn: vi.fn() }
		const instance = makeInstance('Missing')
		instance.log = vi.fn()
		const action = connectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byName', name: 'Missing' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('error', expect.stringContaining('Missing'))
	})

	it('does nothing when restApi is null (byName)', async () => {
		parameterStates.set({
			'/composition/columns/1/name': { value: 'Intro' },
		} as any)
		const ws = makeWsApi()
		const columnUtils = { calculateConnectedNextColumn: vi.fn(), calculateConnectedPreviousColumn: vi.fn() }
		const instance = makeInstance('Intro')
		const action = connectColumn(
			() => null,
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { lookupMode: 'byName', name: 'Intro' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})

// ── selectColumn ───────────────────────────────────────────────────────────────

describe('selectColumn', () => {
	it('action=set triggers column select path (false then true)', async () => {
		const ws = makeWsApi()
		const columnUtils = { calculateSelectedNextColumn: vi.fn(), calculateSelectedPreviousColumn: vi.fn() }
		const instance = makeInstance('3')
		const action = selectColumn(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => columnUtils as any,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '3' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/3/select', false)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/columns/3/select', true)
	})
})

// ── selectDeck ─────────────────────────────────────────────────────────────────

describe('selectDeck', () => {
	it('action=set triggers deck select path', async () => {
		const ws = makeWsApi()
		const deckUtils = { calculateNextDeck: vi.fn(), calculatePreviousDeck: vi.fn() }
		const action = selectDeck(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => deckUtils as any
		)
		await (action.callback as any)({ options: { action: 'set', value: '2' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/decks/2/select')
	})

	it('action=add calls calculateNextDeck', async () => {
		const ws = makeWsApi()
		const deckUtils = { calculateNextDeck: vi.fn().mockReturnValue(3), calculatePreviousDeck: vi.fn() }
		const action = selectDeck(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => deckUtils as any
		)
		await (action.callback as any)({ options: { action: 'add', value: '1' } })
		expect(deckUtils.calculateNextDeck).toHaveBeenCalledWith(1)
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/decks/3/select')
	})

	it('action=subtract calls calculatePreviousDeck', async () => {
		const ws = makeWsApi()
		const deckUtils = { calculateNextDeck: vi.fn(), calculatePreviousDeck: vi.fn().mockReturnValue(1) }
		const action = selectDeck(
			() => ({} as any),
			() => ws as any,
			() => null,
			() => deckUtils as any
		)
		await (action.callback as any)({ options: { action: 'subtract', value: '1' } })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/decks/1/select')
	})

	it('does nothing when restApi or deckUtils is null', async () => {
		const ws = makeWsApi()
		const action = selectDeck(() => null, () => ws as any, () => null, () => null)
		await (action.callback as any)({ options: { action: 'set', value: '1' } })
		expect(ws.triggerPath).not.toHaveBeenCalled()
	})
})
