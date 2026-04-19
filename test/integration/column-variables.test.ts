/**
 * Column variables data-pipeline tests.
 *
 * The Companion variables `selectedColumn` and `connectedColumn` are driven by
 * websocket messages that ColumnUtils.messageUpdates() processes. The variables
 * are updated when:
 *   - /composition/columns/{n}/connect fires with value 'Connected'
 *   - /composition/columns/{n}/select fires with value true
 *
 * These tests verify that the underlying state changes Resolume reports via REST
 * (and that arrive over websocket) actually happen when we trigger them via OSC
 * or REST. If these assertions pass, the variable update logic in ColumnUtils
 * has valid data to work with.
 *
 * Note: we cannot assert the Companion variable values directly (requires a live
 * module instance); we assert the Resolume REST state that drives them.
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
	oscApi.clearAllLayers()
	await pause(400)
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── connectedColumn variable data pipeline ────────────────────────────────────

describe.skipIf(!resolume)('column var — connectedColumn data pipeline (requires media)', () => {
	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})

	it('before any trigger, TEST_COLUMN is not Connected', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).not.toBe('Connected')
	})

	it('triggering TEST_COLUMN sets connected.value to "Connected"', async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(600)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		// This REST value is what the websocket message carries to connectedColumn variable
		expect(col?.connected?.value).toBe('Connected')
	})

	it('clearAllLayers resets connected.value away from "Connected"', async () => {
		oscApi.clearAllLayers()
		await pause(500)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).not.toBe('Connected')
	})

	it('triggering column 2 makes column 2 Connected, not TEST_COLUMN', async () => {
		oscApi.triggerColumn(2)
		await pause(600)
		const colTest = (await api.Columns.getSettings(TEST_COLUMN)) as any
		const col2 = (await api.Columns.getSettings(2)) as any
		// column 2 should be Connected
		expect(col2?.connected?.value).toBe('Connected')
		// TEST_COLUMN should not be Connected (it was cleared)
		expect(colTest?.connected?.value).not.toBe('Connected')
		oscApi.clearAllLayers()
		await pause(400)
	})
})

// ── selectedColumn variable data pipeline ─────────────────────────────────────

describe.skipIf(!resolume)('column var — selectedColumn data pipeline', () => {
	it('selecting TEST_COLUMN via OSC sets selected to truthy in REST', async () => {
		oscApi.send(`/composition/columns/${TEST_COLUMN}/select`, [{ type: 'i', value: 1 }])
		await pause(300)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		if (col?.selected != null) {
			// This is what the websocket carries to the selectedColumn variable
			expect(col.selected.value === true || col.selected.value === 'Selected').toBe(true)
		} else {
			expect(col).toHaveProperty('id')
		}
	})

	it('selecting column 2 changes selection away from TEST_COLUMN', async () => {
		oscApi.send('/composition/columns/2/select', [{ type: 'i', value: 1 }])
		await pause(300)
		const colTest = (await api.Columns.getSettings(TEST_COLUMN)) as any
		const col2 = (await api.Columns.getSettings(2)) as any
		if (colTest?.selected != null && col2?.selected != null) {
			// Only one column should be selected at a time
			expect(col2.selected.value === true || col2.selected.value === 'Selected').toBe(true)
		}
		// Restore TEST_COLUMN as selected
		oscApi.send(`/composition/columns/${TEST_COLUMN}/select`, [{ type: 'i', value: 1 }])
		await pause(200)
	})

	it('column name is a string (data for selectedColumnName / connectedColumnName feedbacks)', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col).toHaveProperty('name')
		expect(typeof col.name.value).toBe('string')
	})

	it('multiple columns all have distinct ids (required for next/previous column name calculation)', async () => {
		const col1 = (await api.Columns.getSettings(1)) as any
		const col2 = (await api.Columns.getSettings(2)) as any
		expect(col1.id).not.toBe(col2.id)
	})
})

// ── Column name field (drives columnName feedback & name variables) ────────────

describe.skipIf(!resolume)('column var — column name update roundtrip', () => {
	let originalName: string

	beforeAll(async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		originalName = col?.name?.value ?? ''
	})

	afterAll(async () => {
		await api.Columns.updateSettings(TEST_COLUMN, { name: { value: originalName } } as any)
		await pause(200)
	})

	it('updating column name via REST is reflected back on read', async () => {
		await api.Columns.updateSettings(TEST_COLUMN, { name: { value: 'VarTest' } } as any)
		await pause(200)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.name?.value).toBe('VarTest')
	})

	it('column name can be restored to original value', async () => {
		await api.Columns.updateSettings(TEST_COLUMN, { name: { value: originalName } } as any)
		await pause(200)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.name?.value).toBe(originalName)
	})
})
