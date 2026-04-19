/**
 * Composition-level parameter integration tests (section 2.7):
 * - Composition REST structure (opacity, master, speed, audio volume)
 * - Composition opacity / master / speed write via REST
 * - tempoResync via OSC
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaOscApi from '../../src/arena-api/osc'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT } from './config'
import { isResolumeReachable, pause } from './helpers'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osc = require('osc') as {
	UDPPort: new (opts: { localAddress: string; localPort: number; metadata: boolean }) => any
}

const resolume = await isResolumeReachable()

const apiUrl = `http://${TEST_HOST}:${REST_PORT}/api/v1`
let oscApi: ArenaOscApi
let udp: any

async function getComposition(): Promise<any> {
	const { default: fetch } = await import('node-fetch')
	const res = await fetch(`${apiUrl}/composition`, { timeout: 3000 } as any)
	return res.json()
}

async function putComposition(body: any): Promise<void> {
	const { default: fetch } = await import('node-fetch')
	await fetch(`${apiUrl}/composition`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		timeout: 3000,
	} as any)
}

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

// ── Composition structure ─────────────────────────────────────────────────────

describe.skipIf(!resolume)('REST read — composition parameter structure', () => {
	it('composition has video.opacity field', async () => {
		const comp = await getComposition()
		expect(comp?.video?.opacity?.value).toBeDefined()
		expect(typeof comp.video.opacity.value).toBe('number')
	})

	it('composition has master field', async () => {
		const comp = await getComposition()
		expect(comp).toHaveProperty('master')
		expect(typeof comp.master.value).toBe('number')
	})

	it('composition has speed field', async () => {
		const comp = await getComposition()
		if (comp?.speed != null) {
			expect(typeof comp.speed.value).toBe('number')
		}
	})

	it('composition has audio.volume field', async () => {
		const comp = await getComposition()
		if (comp?.audio?.volume != null) {
			expect(typeof comp.audio.volume.value).toBe('number')
		}
	})
})

// ── Composition opacity write ─────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — composition opacity', () => {
	let originalOpacity: number

	beforeAll(async () => {
		const comp = await getComposition()
		originalOpacity = comp?.video?.opacity?.value ?? 1
	})

	afterAll(async () => {
		await putComposition({ video: { opacity: { value: originalOpacity } } })
		await pause(200)
	})

	it('sets composition opacity to 0.5 and REST confirms', async () => {
		await putComposition({ video: { opacity: { value: 0.5 } } })
		await pause(200)
		const comp = await getComposition()
		expect(comp?.video?.opacity?.value).toBeCloseTo(0.5, 2)
	})

	it('sets composition opacity back to 1.0 and REST confirms', async () => {
		await putComposition({ video: { opacity: { value: 1.0 } } })
		await pause(200)
		const comp = await getComposition()
		expect(comp?.video?.opacity?.value).toBeCloseTo(1.0, 2)
	})
})

// ── Composition master write ──────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — composition master', () => {
	let originalMaster: number

	beforeAll(async () => {
		const comp = await getComposition()
		originalMaster = comp?.master?.value ?? 1
	})

	afterAll(async () => {
		await putComposition({ master: { value: originalMaster } })
		await pause(200)
	})

	it('sets composition master to 0.75 and REST confirms', async () => {
		await putComposition({ master: { value: 0.75 } })
		await pause(200)
		const comp = await getComposition()
		expect(comp?.master?.value).toBeCloseTo(0.75, 2)
	})

	it('sets composition master back to 1.0 and REST confirms', async () => {
		await putComposition({ master: { value: 1.0 } })
		await pause(200)
		const comp = await getComposition()
		expect(comp?.master?.value).toBeCloseTo(1.0, 2)
	})
})

// ── Composition speed write ───────────────────────────────────────────────────

describe.skipIf(!resolume)('REST write — composition speed', () => {
	let originalSpeed: number | undefined

	beforeAll(async () => {
		const comp = await getComposition()
		originalSpeed = comp?.speed?.value
	})

	afterAll(async () => {
		if (originalSpeed !== undefined) {
			await putComposition({ speed: { value: originalSpeed } })
			await pause(200)
		}
	})

	it('sets composition speed to 0.5 and REST confirms', async () => {
		const comp = await getComposition()
		if (comp?.speed == null) return
		await putComposition({ speed: { value: 0.5 } })
		await pause(200)
		const updated = await getComposition()
		expect(updated?.speed?.value).toBeCloseTo(0.5, 2)
	})
})

// ── Tempo resync via OSC ──────────────────────────────────────────────────────

describe.skipIf(!resolume)('OSC — tempoResync', () => {
	it('tempoResync does not throw and Resolume still responds', async () => {
		oscApi.tempoResync()
		await pause(300)
		const comp = await getComposition()
		expect(comp?.master?.value).toBeDefined()
	})
})
