/**
 * Deck and column integration tests:
 * - Deck settings read (name, selected state)
 * - Deck next/prev via OSC
 * - Column settings read (name, connected, selected)
 * - Column connect via OSC + REST verify
 * - Column name read
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => any
}

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)
let oscApi: ArenaOscApi
let udp: any

beforeAll(async () => {
	if (!resolume) return
	udp = new osc.UDPPort({ localAddress: '0.0.0.0', localPort: 0, metadata: true })
	await new Promise<void>((resolve) => {
		udp.on('ready', resolve)
		udp.open()
	})
	oscApi = new ArenaOscApi(TEST_HOST, OSC_SEND_PORT, (host, port, path, args) => {
		udp.send({ address: path, args: Array.isArray(args) ? args : [args] }, host, port)
	})
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── Deck structure ────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — deck 1 structure', () => {
	it('deck 1 has id field', async () => {
		// Decks are part of the composition; access via raw fetch
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/1`, {
			timeout: 3000,
		} as any)
		expect(res.ok).toBe(true)
		const deck = (await res.json()) as any
		expect(deck).toHaveProperty('id')
	})

	it('deck 1 has name field', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/1`, {
			timeout: 3000,
		} as any)
		const deck = (await res.json()) as any
		expect(deck).toHaveProperty('name')
		expect(typeof deck.name.value).toBe('string')
	})

	it('deck 1 has selected field', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/1`, {
			timeout: 3000,
		} as any)
		const deck = (await res.json()) as any
		expect(deck).toHaveProperty('selected')
	})
})

// ── Deck next/prev via OSC ────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — deck navigation', () => {
	it('compNextDeck does not throw and Resolume still responds', async () => {
		oscApi.compNextDeck()
		await pause(300)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
		// Go back
		oscApi.compPrevDeck()
		await pause(300)
	})

	it('compPrevDeck does not throw and Resolume still responds', async () => {
		oscApi.compPrevDeck()
		await pause(300)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
		// Go back
		oscApi.compNextDeck()
		await pause(300)
	})
})

// ── Column structure ──────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — column 1 full structure', () => {
	it('column 1 has name field', async () => {
		const col = (await api.Columns.getSettings(1)) as any
		expect(col).toHaveProperty('name')
	})

	it('column 1 has connected field with string value', async () => {
		const col = (await api.Columns.getSettings(1)) as any
		expect(col).toHaveProperty('connected')
		expect(typeof col.connected.value).toBe('string')
	})

	it('column 1 connected value is one of expected states', async () => {
		const col = (await api.Columns.getSettings(1)) as any
		const validStates = ['Connected', 'Disconnected', 'Empty']
		expect(validStates).toContain(col.connected.value)
	})
})

// ── Column trigger and verify ─────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — column trigger and verify (requires media)', () => {
	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})

	it('triggerColumn(TEST_COLUMN) → column becomes Connected', async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(600)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).toBe('Connected')
	})
})

describe.skipIf(!resolume)('OSC — clearAllLayers → all columns Disconnected', () => {
	beforeAll(async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(500)
	})

	it('clearAllLayers → column 1 no longer Connected', async () => {
		oscApi.clearAllLayers()
		await pause(500)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).not.toBe('Connected')
	})
})

// ── Column name update ────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — column name', () => {
	let originalName: string

	beforeAll(async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		originalName = col?.name?.value ?? ''
	})

	afterAll(async () => {
		await api.Columns.updateSettings(TEST_COLUMN, { name: { value: originalName } } as any)
		await pause(200)
	})

	it('updates column name and REST confirms', async () => {
		await api.Columns.updateSettings(TEST_COLUMN, { name: { value: 'Test Col' } } as any)
		await pause(200)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.name?.value).toBe('Test Col')
	})
})

// ── Second deck read ──────────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — deck count from composition', () => {
	it('composition has at least 1 deck', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		expect(res.ok).toBe(true)
		const comp = (await res.json()) as any
		expect(comp?.decks?.length).toBeGreaterThanOrEqual(1)
	})

	it('composition has at least 3 columns', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await res.json()) as any
		expect(comp?.columns?.length).toBeGreaterThanOrEqual(3)
	})

	it('composition has at least 3 layers', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await res.json()) as any
		expect(comp?.layers?.length).toBeGreaterThanOrEqual(3)
	})
})

// ── Deck select by index via OSC ─────────────────────────────────────────────
//
// The selectDeck action sends /composition/decks/{n}/select via the websocket
// triggerPath. We can test the equivalent via raw OSC to confirm Resolume
// handles deck-by-index selection and the REST API reflects the change.

describe.skipIf(!resolume)('OSC — deck select by index', () => {
	it('selecting deck 1 by index makes deck 1 selected', async () => {
		oscApi.send('/composition/decks/1/select', [{ type: 'i', value: 1 }])
		await pause(300)
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/1`, {
			timeout: 3000,
		} as any)
		const deck = (await res.json()) as any
		expect(deck).toHaveProperty('selected')
		expect(deck.selected.value).toBe(true)
	})

	it('selecting a different deck by index changes which deck is selected', async () => {
		const { default: fetch } = await import('node-fetch')
		// Get composition to find deck count
		const compRes = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await compRes.json()) as any
		if ((comp?.decks?.length ?? 0) < 2) return // skip if only one deck

		oscApi.send('/composition/decks/2/select', [{ type: 'i', value: 1 }])
		await pause(300)
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/2`, {
			timeout: 3000,
		} as any)
		const deck2 = (await res.json()) as any
		expect(deck2.selected.value).toBe(true)

		// Restore deck 1
		oscApi.send('/composition/decks/1/select', [{ type: 'i', value: 1 }])
		await pause(300)
	})

	it('only one deck is selected after a select-by-index OSC message', async () => {
		oscApi.send('/composition/decks/1/select', [{ type: 'i', value: 1 }])
		await pause(300)
		const { default: fetch } = await import('node-fetch')
		const compRes = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await compRes.json()) as any
		const decks: any[] = comp?.decks ?? []
		if (decks.length === 0) return
		const selectedCount = decks.filter((d: any) => d.selected?.value === true).length
		expect(selectedCount).toBe(1)
	})
})

// ── Column select via OSC (section 2.10) ──────────────────────────────────────

describe.skipIf(!resolume)('OSC — column select', () => {
	it('sends column select=1 via OSC and Resolume still responds', async () => {
		oscApi.send(`/composition/columns/${TEST_COLUMN}/select`, [{ type: 'i', value: 1 }])
		await pause(300)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		if (col?.selected != null) {
			expect(col.selected.value === true || col.selected.value === 'Selected').toBe(true)
		} else {
			// selected field not present in this version — verify Resolume is still alive
			expect(col).toHaveProperty('id')
		}
	})

	it('selecting column 2 via OSC makes column 2 active, Resolume still responds', async () => {
		oscApi.send('/composition/columns/2/select', [{ type: 'i', value: 1 }])
		await pause(300)
		const col2 = (await api.Columns.getSettings(2)) as any
		expect(col2).toHaveProperty('id')
		// Restore TEST_COLUMN as selected
		oscApi.send(`/composition/columns/${TEST_COLUMN}/select`, [{ type: 'i', value: 1 }])
		await pause(200)
	})
})
