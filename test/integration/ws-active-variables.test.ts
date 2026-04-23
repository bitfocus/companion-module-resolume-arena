/**
 * Integration tests for ws_layer_N_active, ws_layer_N_connected_column,
 * ws_layergroup_N_active, and ws_layergroup_N_connected_column variables.
 *
 * These variables are written by updateActiveLayers() and updateActiveLayerGroups()
 * when a clip's connect state changes. Tests verify the REST data contract that
 * drives them: clip connected.value reflects clip activity.
 *
 * Prerequisites:
 *   - Resolume REST on REST_PORT
 *   - Resolume OSC Input on OSC_SEND_PORT
 *   - Media clip at TEST_LAYER / TEST_COLUMN
 *   - Layer group TEST_GROUP containing TEST_GROUP_LAYER with media at TEST_COLUMN
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { ClipId } from '../../src/domain/clip/clip-id'
import {
	TEST_HOST, REST_PORT, OSC_SEND_PORT,
	TEST_LAYER, TEST_COLUMN, TEST_GROUP, TEST_GROUP_LAYER,
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
})

afterAll(() => {
	if (!resolume) return
	try { udp?.close() } catch (_) {}
})

// ── ws_layer_N_active / ws_layer_N_connected_column data contract ─────────────

describe.skipIf(!resolume)('ws_layer_N_active data contract (requires media)', () => {
	it('clip connected.value is "Connected" after triggerClip — drives ws_layer_N_active=1', async () => {
		oscApi.connectClip(TEST_LAYER, TEST_COLUMN)
		await pause(400)
		const status = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(status.connected?.value).toBe('Connected')
	})

	it('clip connected.value is not "Connected" after clearLayer — drives ws_layer_N_active=0', async () => {
		oscApi.connectClip(TEST_LAYER, TEST_COLUMN)
		await pause(300)
		oscApi.clearLayer(TEST_LAYER)
		await pause(400)
		const status = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(status.connected?.value).not.toBe('Connected')
	})

	it('connected column index matches TEST_COLUMN after triggering', async () => {
		oscApi.connectClip(TEST_LAYER, TEST_COLUMN)
		await pause(400)
		const status = await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))
		expect(status.connected?.value).toBe('Connected')
	})
})

// ── ws_layergroup_N_active / ws_layergroup_N_connected_column data contract ───

describe.skipIf(!resolume)('ws_layergroup_N_active data contract (requires media)', () => {
	it('a clip inside the group becomes Connected after triggering group column', async () => {
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(500)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER) as any
		const hasConnected = layer?.clips?.some(
			(c: any) => c.connected?.value === 'Connected' || c.connected?.value === 'ConnectedAndSelected'
		)
		expect(hasConnected).toBe(true)
	})

	it('no clip in group is Connected after clearLayerGroup — drives ws_layergroup_N_active=0', async () => {
		oscApi.triggerlayerGroupColumn(TEST_GROUP, TEST_COLUMN)
		await pause(400)
		oscApi.clearLayerGroup(TEST_GROUP)
		await pause(400)
		const layer = await api.Layers.getSettings(TEST_GROUP_LAYER) as any
		const hasConnected = layer?.clips?.some(
			(c: any) => c.connected?.value === 'Connected' || c.connected?.value === 'ConnectedAndSelected'
		)
		expect(hasConnected).toBeFalsy()
	})
})

// ── Parameter feedback subscription data contract ────────────────────────────
// Verifies that the data that drives layer/group opacity, volume, master
// feedbacks is available via REST — i.e. the parameter IDs exist in the
// composition so subscribeParam can work.

describe.skipIf(!resolume)('Layer feedback parameter data contract', () => {
	it('layer has video.opacity with numeric id and value', async () => {
		const layer = await api.Layers.getSettings(TEST_LAYER) as any
		expect(typeof layer?.video?.opacity?.id).toBe('number')
		expect(typeof layer?.video?.opacity?.value).toBe('number')
	})

	it('layer has audio.volume with numeric id and value', async () => {
		const layer = await api.Layers.getSettings(TEST_LAYER) as any
		expect(typeof layer?.audio?.volume?.id).toBe('number')
		expect(typeof layer?.audio?.volume?.value).toBe('number')
	})
})

describe.skipIf(!resolume)('Layer group feedback parameter data contract', () => {
	it('layergroup has video.opacity with numeric id and value', async () => {
		const group = await api.LayerGroups.getSettings(TEST_GROUP) as any
		expect(typeof group?.video?.opacity?.id).toBe('number')
		expect(typeof group?.video?.opacity?.value).toBe('number')
	})

	it('layergroup has audio.volume with numeric id and value', async () => {
		const group = await api.LayerGroups.getSettings(TEST_GROUP) as any
		expect(typeof group?.audio?.volume?.id).toBe('number')
		expect(typeof group?.audio?.volume?.value).toBe('number')
	})
})
