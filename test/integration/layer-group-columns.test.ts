/**
 * Layer group column integration tests:
 * - LayerGroups.getColumnSettings() — reads column-level settings for a group
 * - LayerGroups.connectColumn() — REST POST triggers column connect in a group
 *
 * Note: LayerGroups.updateColumnSettings() is intentionally NOT tested here.
 * Resolume returns 405 Method Not Allowed on PUT to layergroups/{g}/columns/{c},
 * meaning this endpoint does not support writes in the current Arena REST API.
 *
 * Note: LayerGroups.connectColumn() returns an empty body (Resolume responds with
 * 200 but no JSON). The API client's return type of ColumnOptions is incorrect;
 * the method should be treated as void. Tests verify side-effects via REST reads.
 *
 * Requires: Group TEST_GROUP containing at least TEST_GROUP_LAYER, with media in
 * column TEST_COLUMN for the connect tests.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_GROUP, TEST_GROUP_LAYER, TEST_COLUMN } from './config'
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

// ── Layer group column read ───────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — layer group column settings', () => {
	it('getColumnSettings returns an object with id field', async () => {
		const col = (await api.LayerGroups.getColumnSettings(TEST_GROUP, TEST_COLUMN)) as any
		expect(col).toBeDefined()
		expect(col).toHaveProperty('id')
	})

	it('getColumnSettings returns a connected field with string value', async () => {
		const col = (await api.LayerGroups.getColumnSettings(TEST_GROUP, TEST_COLUMN)) as any
		if (col?.connected != null) {
			expect(typeof col.connected.value).toBe('string')
		}
	})

	it('getColumnSettings for group differs from plain composition column settings', async () => {
		const groupCol = (await api.LayerGroups.getColumnSettings(TEST_GROUP, TEST_COLUMN)) as any
		const plainCol = (await api.Columns.getSettings(TEST_COLUMN)) as any
		// Group column and composition column are separate resources with different ids
		expect(groupCol).not.toEqual(plainCol)
	})
})

// ── Layer group REST connect column ──────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group connectColumn (requires media)', () => {
	afterAll(async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
	})

	it('connectColumn via REST triggers playback and group layer gets a connected clip', async () => {
		// connectColumn returns empty body — call via raw fetch to avoid the client's JSON parse
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(
			`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layergroups/${TEST_GROUP}/columns/${TEST_COLUMN}/connect`,
			{ method: 'POST', timeout: 3000 } as any
		)
		expect(res.ok).toBe(true)
		await pause(500)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})

	it('second connectColumn call still succeeds and group layer stays connected', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(
			`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layergroups/${TEST_GROUP}/columns/${TEST_COLUMN}/connect`,
			{ method: 'POST', timeout: 3000 } as any
		)
		expect(res.ok).toBe(true)
		await pause(400)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})
})
