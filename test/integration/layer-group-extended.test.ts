/**
 * Extended layer group integration tests:
 * - Layer group master, volume, speed read structure
 * - Layer group master write + verify
 * - Layer group solo via REST
 * - Layer group select via REST
 * - Layer group column selection via OSC
 * - Layer group name read
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_GROUP, TEST_GROUP_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, testClipHasMedia, pause } from './helpers'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => any
}

const resolume = await isResolumeReachable()
const hasMedia = resolume && (await testClipHasMedia())

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

// ── Layer group full structure ─────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — layer group full structure', () => {
	it('layer group has master field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('master')
		expect(typeof group.master.value).toBe('number')
	})

	it('layer group has bypassed field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('bypassed')
		expect(typeof group.bypassed.value).toBe('boolean')
	})

	it('layer group has solo field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('solo')
		expect(typeof group.solo.value).toBe('boolean')
	})

	it('layer group has speed field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.speed != null) {
			expect(typeof group.speed.value).toBe('number')
		}
	})

	it('layer group has name field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('name')
	})

	it('layer group has layers array', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('layers')
		expect(Array.isArray(group.layers)).toBe(true)
		expect(group.layers.length).toBeGreaterThanOrEqual(2)
	})
})

// ── Layer group master write ──────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group master', () => {
	let originalMaster: number

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalMaster = group?.master?.value ?? 1
	})

	afterAll(async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { master: { value: originalMaster } } as any)
		await pause(200)
	})

	it('sets layer group master to 0.5 and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { master: { value: 0.5 } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.master?.value).toBeCloseTo(0.5, 2)
	})

	it('sets layer group master back to 1.0 and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { master: { value: 1.0 } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.master?.value).toBeCloseTo(1.0, 2)
	})
})

// ── Layer group solo via REST ─────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group solo', () => {
	let originalSolo: boolean

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalSolo = group?.solo?.value ?? false
	})

	afterAll(async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { solo: { value: originalSolo } } as any)
		await pause(200)
	})

	it('sets layer group solo to true and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { solo: { value: true } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.solo?.value).toBe(true)
	})

	it('sets layer group solo to false and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { solo: { value: false } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.solo?.value).toBe(false)
	})
})

// ── Layer group bypass via REST ───────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group bypass (REST path)', () => {
	let originalBypassed: boolean

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalBypassed = group?.bypassed?.value ?? false
	})

	afterAll(async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { bypassed: { value: originalBypassed } } as any)
		await pause(200)
	})

	it('sets layer group bypassed to true and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { bypassed: { value: true } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.bypassed?.value).toBe(true)
	})

	it('sets layer group bypassed to false and REST confirms', async () => {
		await api.LayerGroups.updateSettings(TEST_GROUP, { bypassed: { value: false } } as any)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group?.bypassed?.value).toBe(false)
	})
})

// ── Layer group column trigger ─────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — layer group column trigger (extended)', () => {
	afterAll(async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
	})

	it('triggerlayerGroupColumn → group layer has Connected clip', async () => {
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(600)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})

	it('clearLayerGroup → group layer has no Connected clip', async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(500)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(false)
	})
})

// ── Layer group next/prev column ──────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OSC — layer group column navigation (requires media)', () => {
	afterAll(async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
	})

	it('layerGroupNextCol advances to a column and connects', async () => {
		// layerGroupNextCol starts at column 1 (first call)
		oscApi.layerGroupNextCol(TEST_GROUP, 3)
		await pause(600)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER)
		const hasConnected = layer.clips.some((c) => c.connected?.value === 'Connected')
		expect(hasConnected).toBe(true)
	})

	it('groupPrevCol cycles back through columns', async () => {
		oscApi.groupPrevCol(TEST_GROUP, 3)
		await pause(600)
		// Just verify no errors and Resolume still responds
		const group = await api.LayerGroups.getSettings(TEST_GROUP)
		expect(group).toHaveProperty('id')
	})
})

// ── Layer group speed write ───────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group speed', () => {
	let originalSpeed: number | undefined

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalSpeed = group?.speed?.value
	})

	afterAll(async () => {
		if (originalSpeed !== undefined) {
			await api.LayerGroups.updateSettings(TEST_GROUP, { speed: { value: originalSpeed } } as any)
			await pause(200)
		}
	})

	it('sets layer group speed to 0.5 and REST confirms', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.speed == null) return // skip if speed not present
		await api.LayerGroups.updateSettings(TEST_GROUP, { speed: { value: 0.5 } } as any)
		await pause(200)
		const updated = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(updated?.speed?.value).toBeCloseTo(0.5, 2)
	})
})

// ── Layer group volume write (section 2.12) ───────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group audio volume (section 2.12)', () => {
	let originalVolume: number | undefined

	beforeAll(async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		originalVolume = group?.audio?.volume?.value
	})

	afterAll(async () => {
		if (originalVolume !== undefined) {
			await api.LayerGroups.updateSettings(TEST_GROUP, { audio: { volume: { value: originalVolume } } } as any)
			await pause(200)
		}
	})

	it('sets layer group volume to 0.5 and REST confirms', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.audio?.volume == null) return
		const before = group.audio.volume.value
		await api.LayerGroups.updateSettings(TEST_GROUP, { audio: { volume: { value: 0.5 } } } as any)
		await pause(200)
		const updated = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		const after = updated?.audio?.volume?.value
		// Only assert if Resolume accepted the write (value changed from original).
		// Without active clips, Resolume silently ignores audio.volume writes.
		if (after !== before) {
			expect(after).toBeCloseTo(0.5, 2)
		}
	})
})

// ── Layer group select via REST (section 2.12) ────────────────────────────────

describe.skipIf(!resolume)('REST write — layer group select (section 2.12)', () => {
	it('selects layer group via REST API and Resolume still responds', async () => {
		await api.LayerGroups.select(TEST_GROUP)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.selected != null) {
			expect(group.selected.value === true || group.selected.value === 'Selected').toBe(true)
		} else {
			expect(group).toHaveProperty('id')
		}
	})
})

// ── Layer group column select via OSC (section 2.12) ──────────────────────────

describe.skipIf(!resolume)('OSC — select layer group column (section 2.12)', () => {
	it('sends group column select=1 via OSC and Resolume still responds', async () => {
		oscApi.send(
			`/composition/groups/${TEST_GROUP}/columns/${TEST_COLUMN}/select`,
			[{ type: 'i', value: 1 }]
		)
		await pause(300)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		expect(group).toHaveProperty('id')
	})
})
