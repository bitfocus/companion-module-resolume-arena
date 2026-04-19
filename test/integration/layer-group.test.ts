/**
 * Layer group integration tests — REST and OSC operations on Group 1
 * (layers 2 and 3 in the test composition).
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

// ── REST — layer group read ───────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — layer group settings', () => {
	it('returns group settings with id field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('id')
	})
})

// ── REST — layer group read ───────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — layer group opacity', () => {
	let originalOpacity: number

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalOpacity = group?.video?.opacity?.value ?? 1
	})

	afterAll(async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { video: { opacity: { value: originalOpacity } } } as any)
	})

	it('sets layer group opacity to 0.5 and REST confirms the new value', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { video: { opacity: { value: 0.5 } } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.video?.opacity?.value).toBeCloseTo(0.5, 2)
	})
})

// ── OSC — layer group bypass ──────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — bypass layer group and verify via REST', () => {
	afterAll(async () => {
		oscApi.bypassLayerGroup(TEST_GROUP, { type: 'i', value: 0 })
		await pause(300)
	})

	it('bypasses layer group via OSC and REST confirms bypassed = true', async () => {
		oscApi.bypassLayerGroup(TEST_GROUP, { type: 'i', value: 1 })
		await pause(400)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.bypassed?.value).toBe(true)
	})

	it('unbypasses layer group via OSC and REST confirms bypassed = false', async () => {
		oscApi.bypassLayerGroup(TEST_GROUP, { type: 'i', value: 0 })
		await pause(400)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.bypassed?.value).toBe(false)
	})
})

// ── OSC — layer group trigger column ─────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer group trigger column (requires media)', () => {
	afterAll(async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
	})

	it('triggerlayerGroupColumn → TEST_GROUP_LAYER has a connected clip', async () => {
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(600)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})
})

// ── OSC — layer group clear ───────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — layer group clear (requires media)', () => {
	beforeAll(async () => {
		// First connect something so there is something to clear
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(500)
	})

	it('clearLayerGroup → group layers have no connected clips', async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(500)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(false)
	})
})
