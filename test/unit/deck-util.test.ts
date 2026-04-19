import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeckUtils } from '../../src/domain/deck/deck-util'
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
		parseVariablesInString: vi.fn().mockImplementation((s: string) => Promise.resolve(s)),
		_wsApi: wsApi,
	}
	return instance as any
}

function makeFeedback(opts: Record<string, any>) {
	return { id: 'fb1', options: opts } as any
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

// ── messageUpdates ─────────────────────────────────────────────────────────────

describe('DeckUtils.messageUpdates — path matching', () => {
	it('calls checkFeedbacks("deckName") on name path', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du.messageUpdates({ path: '/composition/decks/1/name' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('deckName')
	})

	it('calls checkFeedbacks("deckSelected") on select path', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du.messageUpdates({ path: '/composition/decks/2/select' }, false)
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('deckSelected')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('selectedDeckName')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('nextDeckName')
		expect(mod.checkFeedbacks).toHaveBeenCalledWith('previousDeckName')
	})

	it('does not crash for unrelated paths', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du.messageUpdates({ path: '/composition/tempo' }, false)
		expect(mod.checkFeedbacks).not.toHaveBeenCalled()
	})

	it('runs initConnectedFromComposition on isComposition=true when state is set', () => {
		const mod = makeMockModule()
		compositionState.set({ decks: [{ selected: { value: true }, name: { value: 'Deck 1' } }] } as any)
		const du = new DeckUtils(mod)
		du.messageUpdates({ path: undefined }, true)
		expect(mod._wsApi.subscribePath).toHaveBeenCalled()
	})
})

// ── initConnectedFromComposition ──────────────────────────────────────────────

describe('DeckUtils.initConnectedFromComposition', () => {
	it('sets selectedDeck from composition state', () => {
		const mod = makeMockModule()
		compositionState.set({
			decks: [
				{ selected: { value: false }, name: { value: 'Deck 1' } },
				{ selected: { value: true }, name: { value: 'Deck 2' } },
			],
		} as any)
		const du = new DeckUtils(mod)
		du.initConnectedFromComposition()
		// After init, deckSelectedNameFeedbackCallback should reflect selected deck=2
		const result = du.deckSelectedNameFeedbackCallback({} as any)
		expect((result as any).text).toBe('Deck 2')
	})
})

// ── deckSelectedFeedbackCallback ──────────────────────────────────────────────

describe('DeckUtils.deckSelectedFeedbackCallback', () => {
	it('returns true when deck is selected', async () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		parameterStates.set({ '/composition/decks/1/select': { value: true } } as any)
		const result = await du.deckSelectedFeedbackCallback(makeFeedback({ deck: '1' }))
		expect(result).toBe(true)
	})

	it('returns falsy when deck is not selected', async () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		const result = await du.deckSelectedFeedbackCallback(makeFeedback({ deck: '1' }))
		expect(result).toBeFalsy()
	})
})

// ── deckNameFeedbackCallback ───────────────────────────────────────────────────

describe('DeckUtils.deckNameFeedbackCallback', () => {
	it('returns name from parameterStates', async () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		parameterStates.set({ '/composition/decks/2/name': { value: 'My Deck' } } as any)
		const result = await du.deckNameFeedbackCallback(makeFeedback({ deck: '2' }))
		expect((result as any).text).toBe('My Deck')
	})
})

// ── calculateNextDeck / calculatePreviousDeck ─────────────────────────────────

describe('DeckUtils.calculateNextDeck', () => {
	it('advances to next deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 2
		du['lastDeck'] = 4
		expect(du.calculateNextDeck(1)).toBe(3)
	})

	it('wraps to beginning when past last deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 4
		du['lastDeck'] = 4
		expect(du.calculateNextDeck(1)).toBe(1)
	})
})

describe('DeckUtils.calculatePreviousDeck', () => {
	it('goes back to previous deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 3
		du['lastDeck'] = 4
		expect(du.calculatePreviousDeck(1)).toBe(2)
	})

	it('wraps to end when before first deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 1
		du['lastDeck'] = 4
		expect(du.calculatePreviousDeck(1)).toBe(4)
	})
})

// ── deckNextNameFeedbackCallback ───────────────────────────────────────────────

describe('DeckUtils.deckNextNameFeedbackCallback', () => {
	it('returns name of the next deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 1
		du['lastDeck'] = 3
		parameterStates.set({ '/composition/decks/2/name': { value: 'Next Deck' } } as any)
		const result = du.deckNextNameFeedbackCallback(makeFeedback({ next: 1 }))
		expect((result as any).text).toBe('Next Deck')
	})

	it('returns empty when no selectedDeck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		const result = du.deckNextNameFeedbackCallback(makeFeedback({ next: 1 }))
		expect(result).toEqual({})
	})
})

describe('DeckUtils.deckPreviousNameFeedbackCallback', () => {
	it('returns name of the previous deck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		du['selectedDeck'] = 2
		du['lastDeck'] = 3
		parameterStates.set({ '/composition/decks/1/name': { value: 'Prev Deck' } } as any)
		const result = du.deckPreviousNameFeedbackCallback(makeFeedback({ previous: 1 }))
		expect((result as any).text).toBe('Prev Deck')
	})

	it('returns empty when no selectedDeck', () => {
		const mod = makeMockModule()
		const du = new DeckUtils(mod)
		const result = du.deckPreviousNameFeedbackCallback(makeFeedback({ previous: 1 }))
		expect(result).toEqual({})
	})
})
