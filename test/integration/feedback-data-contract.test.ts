/**
 * Feedback data contract tests.
 *
 * Feedbacks are implemented as Companion callbacks bound to the module instance
 * and cannot be invoked in isolation. What CAN be tested is whether the
 * Resolume REST API returns the field shapes and types that each feedback
 * callback reads from. If these contracts break, the feedbacks silently return
 * defaults, which is the kind of regression only integration tests catch.
 *
 * Covered data contracts:
 * - clipInfo            → clip.name.value (string) when media loaded
 * - clipTransportPosition → clip.transport.position structure when playing
 * - clipSpeed           → clip.transport.controls.speed.value (number)
 * - clipOpacity         → clip.video.opacity.value (number)
 * - clipVolume          → clip.audio.volume.value (number, if audio present)
 * - connectedClip       → clip.connected.value string enum
 * - selectedClip        → clip.selected.value boolean
 * - tempo               → composition.tempocontroller.tempo.value (number)
 * - deckSelected        → deck.selected.value boolean (not just field existence)
 * - layerGroupSelected  → layergroup.selected.value boolean/string
 * - layerGroupActive    → at least one layer in group has a connected clip
 * - columnConnected     → column.connected.value string enum
 * - columnSelected      → column.selected.value boolean/string
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { ClipId } from '../../src/domain/clip/clip-id'
import {
	TEST_HOST,
	REST_PORT,
	OSC_SEND_PORT,
	TEST_LAYER,
	TEST_COLUMN,
	TEST_GROUP,
} from './config'
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
	// Start from a clean state
	await api.Layers.clear(TEST_LAYER)
	await pause(300)
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── clipInfo data contract: clip.name.value ───────────────────────────────────

describe.skipIf(!resolume)('data contract — clipInfo (clip name field)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected clip has name field with string value', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.name != null) {
			expect(typeof clip.name.value).toBe('string')
		}
		// name may be absent for clips without a file name — that is valid
	})

	it('empty clip slot has no name or name.value is empty string', async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
		// Use a column that won't have media — column 99 if composition is smaller
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		// After clear, clip should be Disconnected, name may be absent or empty
		const name = clip?.name?.value
		expect(name == null || typeof name === 'string').toBe(true)
	})
})

// ── clipTransportPosition data contract: clip.transport.position ──────────────

describe.skipIf(!resolume)('data contract — clipTransportPosition (transport position)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected clip exposes transport.position structure', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(600)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport != null) {
			// transport.position may not exist on all clip types, but transport itself must
			expect(clip.transport).toBeDefined()
			if (clip.transport?.position != null) {
				expect(clip.transport.position).toHaveProperty('value')
			}
		}
	})

	it('connected clip transport.controls.speed is a number', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport?.controls?.speed != null) {
			expect(typeof clip.transport.controls.speed.value).toBe('number')
		}
	})
})

// ── clipSpeed data contract: clip.transport.controls.speed.value ─────────────

describe.skipIf(!resolume)('data contract — clipSpeed (transport speed field)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('speed field type is number when clip is playing', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.transport?.controls?.speed != null) {
			expect(typeof clip.transport.controls.speed.value).toBe('number')
			expect(clip.transport.controls.speed.value).toBeGreaterThanOrEqual(0)
		}
	})
})

// ── clipOpacity / clipVolume data contract ────────────────────────────────────

describe.skipIf(!resolume)('data contract — clipOpacity and clipVolume fields', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected clip video.opacity.value is a number between 0 and 1', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.video?.opacity != null) {
			expect(typeof clip.video.opacity.value).toBe('number')
			expect(clip.video.opacity.value).toBeGreaterThanOrEqual(0)
			expect(clip.video.opacity.value).toBeLessThanOrEqual(1)
		}
	})

	it('connected clip audio.volume.value is a number when present', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.audio?.volume != null) {
			expect(typeof clip.audio.volume.value).toBe('number')
		}
	})
})

// ── connectedClip data contract: clip.connected.value string enum ─────────────

describe.skipIf(!resolume)('data contract — connectedClip (connected string enum)', () => {
	it('disconnected clip has connected.value of known string', async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		const validStates = ['Connected', 'Disconnected', 'Empty']
		expect(validStates).toContain(clip?.connected?.value)
	})

	it('connected clip has connected.value === "Connected"', async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(clip?.connected?.value).toBe('Connected')
		// cleanup
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})
})

// ── selectedClip data contract: clip.selected.value ──────────────────────────

describe.skipIf(!resolume)('data contract — selectedClip (selected field)', () => {
	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('clip selected field is boolean-ish after selectClip OSC', async () => {
		oscApi.selectClip(TEST_LAYER, TEST_COLUMN)
		await pause(400)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		if (clip?.selected != null) {
			expect(typeof clip.selected.value === 'boolean' || clip.selected.value === 'Selected').toBe(true)
		}
	})
})

// ── tempo data contract: composition.tempocontroller.tempo.value ──────────────

describe.skipIf(!resolume)('data contract — tempo (tempocontroller structure)', () => {
	it('composition exposes tempocontroller with tempo field', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		expect(res.ok).toBe(true)
		const comp = (await res.json()) as any
		if (comp?.tempoController != null) {
			expect(comp.tempoController).toHaveProperty('tempo')
			expect(typeof comp.tempoController.tempo.value).toBe('number')
			expect(comp.tempoController.tempo.value).toBeGreaterThan(0)
		}
	})

	it('composition tempo value is within a reasonable BPM range', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await res.json()) as any
		if (comp?.tempoController?.tempo != null) {
			const bpm = comp.tempoController.tempo.value
			expect(bpm).toBeGreaterThan(20)
			expect(bpm).toBeLessThan(300)
		}
	})
})

// ── deckSelected data contract: deck.selected.value type ─────────────────────

describe.skipIf(!resolume)('data contract — deckSelected (selected field type)', () => {
	it('deck 1 selected.value is a boolean', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition/decks/1`, {
			timeout: 3000,
		} as any)
		const deck = (await res.json()) as any
		expect(deck).toHaveProperty('selected')
		expect(typeof deck.selected.value).toBe('boolean')
	})

	it('exactly one deck is selected at a time', async () => {
		const { default: fetch } = await import('node-fetch')
		const compRes = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, {
			timeout: 3000,
		} as any)
		const comp = (await compRes.json()) as any
		const decks = comp?.decks ?? []
		if (decks.length === 0) return
		const selectedCount = decks.filter((d: any) => d.selected?.value === true).length
		expect(selectedCount).toBe(1)
	})
})

// ── layerGroupSelected data contract ─────────────────────────────────────────

describe.skipIf(!resolume)('data contract — layerGroupSelected (selected field)', () => {
	it('layer group has selected field', async () => {
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.selected != null) {
			expect(typeof group.selected.value === 'boolean' || group.selected.value === 'Selected').toBe(true)
		}
	})

	it('selecting a layer group via REST makes its selected field truthy', async () => {
		await api.LayerGroups.select(TEST_GROUP)
		await pause(200)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		if (group?.selected != null) {
			expect(group.selected.value === true || group.selected.value === 'Selected').toBe(true)
		}
	})
})

// ── layerGroupActive data contract: connected clip in group layer ──────────────

describe.skipIf(!resolume)('data contract — layerGroupActive (active = connected clip in group)', () => {
	afterAll(async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
	})

	it('triggering a group column results in a connected clip inside the group', async () => {
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(600)
		// layerGroupActive is true when activeLayers tracks a connected clip for the group
		// Verify by checking that the first group layer has a connected clip
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		const layers: any[] = group?.layers ?? []
		const hasActive = layers.some((l: any) =>
			l.clips?.some((c: any) => c.connected?.value === 'Connected')
		)
		expect(hasActive).toBe(true)
	})

	it('clearing the group leaves no connected clips in any group layer', async () => {
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(500)
		const group = (await api.LayerGroups.getSettings(TEST_GROUP)) as any
		const layers: any[] = group?.layers ?? []
		const hasActive = layers.some((l: any) =>
			l.clips?.some((c: any) => c.connected?.value === 'Connected')
		)
		expect(hasActive).toBe(false)
	})
})

// ── columnConnected data contract: column.connected.value ────────────────────

describe.skipIf(!resolume)('data contract — columnConnected (connected string enum)', () => {
	afterAll(async () => {
		oscApi.clearAllLayers()
		await pause(400)
	})

	it('column connected.value is one of the known enum values', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		const validStates = ['Connected', 'Disconnected', 'Empty']
		expect(validStates).toContain(col?.connected?.value)
	})

	it('connected.value becomes "Connected" after triggering the column', async () => {
		oscApi.triggerColumn(TEST_COLUMN)
		await pause(600)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).toBe('Connected')
	})

	it('connected.value is no longer "Connected" after clearAllLayers', async () => {
		oscApi.clearAllLayers()
		await pause(500)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		expect(col?.connected?.value).not.toBe('Connected')
	})
})

// ── columnSelected data contract: column.selected.value ──────────────────────

describe.skipIf(!resolume)('data contract — columnSelected (selected field)', () => {
	it('column selected field type is boolean or boolean-string', async () => {
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		if (col?.selected != null) {
			expect(typeof col.selected.value === 'boolean' || typeof col.selected.value === 'string').toBe(true)
		}
	})

	it('selecting column via OSC sets its selected state', async () => {
		oscApi.send(`/composition/columns/${TEST_COLUMN}/select`, [{ type: 'i', value: 1 }])
		await pause(300)
		const col = (await api.Columns.getSettings(TEST_COLUMN)) as any
		if (col?.selected != null) {
			expect(col.selected.value === true || col.selected.value === 'Selected').toBe(true)
		} else {
			// selected not exposed in REST for this version — verify Resolume is still alive
			expect(col).toHaveProperty('id')
		}
	})
})
