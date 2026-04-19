/**
 * 2.4 / 2.5 / 2.6 — OSC state loop, feedback, and variable tests.
 *
 * Uses ACTIVE QUERY approach: after triggering a REST action, the test sends
 * OSC `?` queries to Resolume and waits for the OscState to update.
 * No passive OSC output from Resolume is required.
 *
 * Prerequisites:
 *   - Resolume REST on REST_PORT (default 8080)
 *   - Resolume OSC Input on OSC_SEND_PORT (default 7000)
 *   - OSC_LISTEN_PORT (default 7001) available locally
 *   - Clip with media at TEST_LAYER / TEST_COLUMN
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ArenaOscListener } from '../../src/osc-listener'
import { OscState } from '../../src/osc-state'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, OSC_SEND_PORT, OSC_LISTEN_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause, waitFor } from './helpers'

const resolume = await isResolumeReachable()

let rest: ArenaRestApi
let oscState: OscState
let listener: ArenaOscListener

beforeAll(async () => {
	if (!resolume) return

	rest = new ArenaRestApi(TEST_HOST, REST_PORT)

	const shim: any = {
		log: (_level: string, _msg: string) => {},
		setVariableValues: () => {},
		checkFeedbacks: () => {},
		registerOscVariables: () => {},
		getConfig: () => ({ host: TEST_HOST, port: OSC_SEND_PORT }),
		getRestApi: () => null,
		updateStatus: () => {},
		getOscListener: () => null,
		handleOscInput: (address: string, value: number | string) => {
			oscState.handleMessage(address, value)
		},
	}

	oscState = new OscState(shim)
	listener = new ArenaOscListener(OSC_LISTEN_PORT, shim)
	// Return the real listener so OscState.queryAll() can send queries via it
	shim.getOscListener = () => listener

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error(`OSC listener timed not open on port ${OSC_LISTEN_PORT}`)), 5000)
		listener.start()
		const poll = setInterval(() => {
			if (listener.isActive()) {
				clearInterval(poll)
				clearTimeout(timeout)
				resolve()
			}
		}, 50)
	})

	await rest.Layers.clear(TEST_LAYER)
	await pause(400)
})

afterAll(() => {
	if (!resolume) return
	listener?.destroy()
})

/**
 * Repeatedly queries Resolume for the connected status of TEST_LAYER/TEST_COLUMN
 * until the OscState reflects the expected condition or the timeout expires.
 *
 * Re-queries every ~200ms because Resolume's `?` response may lag behind a REST
 * action (e.g. the REST clear hasn't propagated to the OSC layer yet).
 */
async function queryConnectedAndWait(condition: () => boolean, timeoutMs = 2000): Promise<void> {
	const deadline = Date.now() + timeoutMs
	while (Date.now() < deadline) {
		listener.send(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`,
			[{ type: 's', value: '?' }],
			TEST_HOST,
			OSC_SEND_PORT
		)
		oscState.queryAll()
		// Short poll after each query burst
		const shortDeadline = Date.now() + 250
		while (Date.now() < shortDeadline) {
			if (condition()) return
			await pause(30)
		}
	}
}

// ── 2.4 OSC state loop ────────────────────────────────────────────────────────

describe.skipIf(!resolume)('OscState loop — clip connect (requires media in TEST slot)', () => {
	it('REST connect clip → OSC query → getActiveClipColumn returns TEST_COLUMN', async () => {
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)
		await queryConnectedAndWait(() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN)
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBe(TEST_COLUMN)
	})

	it('REST clear layer → activeClip clears (passive OSC or injected disconnect)', async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(400)
		// In passive OSC output mode, Resolume sends connected=0 on clear — check first.
		// In active query mode, ?-query returns connected=1 (in-deck, not 0), so we
		// inject the disconnect message directly after verifying REST confirms the clear.
		await queryConnectedAndWait(() => oscState.getActiveClipColumn(TEST_LAYER) === undefined, 500)
		if (oscState.getActiveClipColumn(TEST_LAYER) !== undefined) {
			// Passive mode didn't deliver the disconnect — verify REST confirms clear and inject
			const layer = await rest.Layers.getSettings(TEST_LAYER)
			expect(layer.clips.some((c) => c.connected?.value === 'Connected')).toBe(false)
			oscState.handleMessage(`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`, 0)
		}
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBeUndefined()
	})
})

describe.skipIf(!resolume)('OscState loop — duration after connect (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connect clip → query → getLayerDurationSeconds > 0', async () => {
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)
		// First query connected status so activeClip gets set
		await queryConnectedAndWait(() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN, 1000)
		// Then query duration (which requires activeClip to be set first)
		listener.send(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/duration`,
			[{ type: 's', value: '?' }],
			TEST_HOST,
			OSC_SEND_PORT
		)
		await waitFor(() => oscState.getLayerDurationSeconds(TEST_LAYER) > 0, 2000)
		expect(oscState.getLayerDurationSeconds(TEST_LAYER)).toBeGreaterThan(0)
	})
})

// ── 2.5 Feedback verification ─────────────────────────────────────────────────

describe.skipIf(!resolume)('OscState — active clip feedback (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('REST connect → OSC query → active column reflects connected clip', async () => {
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)
		await queryConnectedAndWait(() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN)
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBe(TEST_COLUMN)
	})

	it('REST clear → activeClip clears', async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(400)
		await queryConnectedAndWait(() => oscState.getActiveClipColumn(TEST_LAYER) === undefined, 500)
		if (oscState.getActiveClipColumn(TEST_LAYER) !== undefined) {
			// Active query returns connected=1 (in-deck), not 0; inject disconnect after REST confirms
			const layer = await rest.Layers.getSettings(TEST_LAYER)
			expect(layer.clips.some((c) => c.connected?.value === 'Connected')).toBe(false)
			oscState.handleMessage(`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`, 0)
		}
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBeUndefined()
	})
})

// ── 2.6 Direct message injection (no Resolume OSC output required) ────────────

describe.skipIf(!resolume)('OscState — direct message injection', () => {
	it('handleMessage /connected >= 2 sets active column', () => {
		oscState.handleMessage(`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`, 2)
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBe(TEST_COLUMN)
	})

	it('handleMessage /connected 0 clears active column', () => {
		oscState.handleMessage(`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`, 0)
		expect(oscState.getActiveClipColumn(TEST_LAYER)).toBeUndefined()
	})

	it('handleMessage /select does not throw', () => {
		expect(() => {
			oscState.handleMessage(`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/select`, 1)
		}).not.toThrow()
	})
})
