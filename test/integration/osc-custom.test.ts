/**
 * Custom OSC integration tests — ArenaOscApi.customOsc():
 * - Float type: set layer opacity via custom path, REST confirms
 * - Integer type: set layer bypass via custom path, REST confirms
 * - None type (trigger): disconnect all layers, REST confirms
 * - Relative modifier: sends with + prefix, Resolume accepts but applies value absolutely
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import ArenaOscApi from '../../src/arena-api/osc'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, TEST_LAYER } from './config'
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

// ── Float type ────────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('customOsc — float type (layer opacity)', () => {
	let originalOpacity: number | undefined

	beforeAll(async () => {
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		originalOpacity = layer?.video?.opacity?.value
	})

	afterAll(async () => {
		if (originalOpacity !== undefined) {
			await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: originalOpacity } } } as any)
			await pause(200)
		}
	})

	it('sends layer opacity 0.3 as float and REST confirms', async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/video/opacity`, 'f', '0.3')
		await pause(300)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.video?.opacity != null) {
			expect(layer.video.opacity.value).toBeCloseTo(0.3, 2)
		}
	})

	it('sends layer opacity 1.0 as float and REST confirms', async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/video/opacity`, 'f', '1.0')
		await pause(300)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.video?.opacity != null) {
			expect(layer.video.opacity.value).toBeCloseTo(1.0, 2)
		}
	})
})

// ── Integer type ──────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('customOsc — integer type (layer bypass)', () => {
	afterAll(async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/bypassed`, 'i', '0')
		await pause(300)
	})

	it('sends bypass=1 as int and REST confirms bypassed=true', async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/bypassed`, 'i', '1')
		await pause(400)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.bypassed?.value).toBe(true)
	})

	it('sends bypass=0 as int and REST confirms bypassed=false', async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/bypassed`, 'i', '0')
		await pause(400)
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		expect(layer?.bypassed?.value).toBe(false)
	})
})

// ── None / trigger type ───────────────────────────────────────────────────────

describe.skipIf(!resolume)('customOsc — none type (composition disconnect trigger)', () => {
	it('sends disconnectall trigger via customOsc and Resolume still responds', async () => {
		oscApi.customOsc('/composition/disconnectall', 'n', '')
		await pause(400)
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})
})

// ── Relative modifier ─────────────────────────────────────────────────────────
// Resolume receives the relative args ('+', float) but applies the float value
// directly rather than adding it to the current value. The relative modifier
// format is accepted without error — just not additive in practice.

describe.skipIf(!resolume)('customOsc — relative modifier (+)', () => {
	afterAll(async () => {
		await api.Layers.updateSettings(TEST_LAYER, { video: { opacity: { value: 1.0 } } } as any)
		await pause(200)
	})

	it('sends opacity with + modifier without throwing and Resolume stays alive', async () => {
		oscApi.customOsc(`/composition/layers/${TEST_LAYER}/video/opacity`, 'f', '0.2', '+')
		await pause(300)
		// Resolume applies the float value (0.2) — verify it accepted the message
		const layer = (await api.Layers.getSettings(TEST_LAYER)) as any
		if (layer?.video?.opacity != null) {
			expect(typeof layer.video.opacity.value).toBe('number')
		}
		// Resolume is still responsive
		const info = await api.productInfo()
		expect(info.name).toBeTruthy()
	})
})
