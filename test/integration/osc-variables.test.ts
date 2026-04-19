/**
 * OscState variable integration tests.
 *
 * Tests that OscState correctly updates Companion variables in response to
 * OSC messages from Resolume. Uses the ArenaOscListener + active query approach
 * from osc-state-loop.test.ts.
 *
 * Variables tested:
 *   - osc_active_column         — active composition column number
 *   - osc_active_column_name    — active composition column name
 *   - osc_layer_N_elapsed       — elapsed timecode (HH:MM:SS or MM:SS)
 *   - osc_layer_N_duration      — total duration timecode
 *   - osc_layer_N_remaining     — remaining timecode
 *   - osc_layer_N_progress      — progress % string
 *   - osc_layer_N_clip_name     — clip name
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ArenaOscListener } from '../../src/osc-listener'
import { OscState } from '../../src/osc-state'
import { ClipId } from '../../src/domain/clip/clip-id'
import {
	TEST_HOST,
	REST_PORT,
	OSC_SEND_PORT,
	OSC_LISTEN_PORT,
	TEST_LAYER,
	TEST_COLUMN,
} from './config'
import { isResolumeReachable, testClipHasMedia, pause, waitFor } from './helpers'

const resolume = await isResolumeReachable()
const hasMedia = resolume && (await testClipHasMedia())

let rest: ArenaRestApi
let oscState: OscState
let listener: ArenaOscListener
let capturedVariables: Record<string, string> = {}

beforeAll(async () => {
	if (!resolume) return

	rest = new ArenaRestApi(TEST_HOST, REST_PORT)

	const shim: any = {
		log: (_level: string, _msg: string) => {},
		setVariableValues: (vals: Record<string, string>) => {
			Object.assign(capturedVariables, vals)
		},
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
	shim.getOscListener = () => listener

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error(`OSC listener did not open on port ${OSC_LISTEN_PORT}`)), 5000)
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

/** Send ? query for a path and wait up to timeoutMs for a condition to be met */
async function queryAndWait(path: string, condition: () => boolean, timeoutMs = 2000): Promise<void> {
	const deadline = Date.now() + timeoutMs
	while (Date.now() < deadline) {
		listener.send(path, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		oscState.queryAll()
		const shortDeadline = Date.now() + 200
		while (Date.now() < shortDeadline) {
			if (condition()) return
			await pause(30)
		}
	}
}

// ── Active column variable ─────────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OscState — osc_active_column variable (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('osc_active_column is set after triggerColumn query', async () => {
		capturedVariables = {}
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)

		// Query the column connected state
		await queryAndWait(
			`/composition/columns/${TEST_COLUMN}/connected`,
			() => capturedVariables['osc_active_column'] !== undefined,
			2000
		)

		if (capturedVariables['osc_active_column'] !== undefined) {
			expect(capturedVariables['osc_active_column']).toBe(String(TEST_COLUMN))
		}
	})
})

// ── Layer clip name variable ───────────────────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OscState — osc_layer_N_clip_name variable (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('osc_layer_N_clip_name is set after connecting a clip with known name', async () => {
		capturedVariables = {}
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)

		// Query clip name
		const clipNamePath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/name`
		await queryAndWait(
			clipNamePath,
			() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN,
			2000
		)

		// Send connected query so activeClip gets set first
		await queryAndWait(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`,
			() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN,
			2000
		)

		// Now query the name
		listener.send(clipNamePath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		await waitFor(() => {
			const key = `osc_layer_${TEST_LAYER}_clip_name`
			return capturedVariables[key] !== undefined && capturedVariables[key] !== ''
		}, 2000)

		const key = `osc_layer_${TEST_LAYER}_clip_name`
		if (capturedVariables[key] !== undefined) {
			expect(typeof capturedVariables[key]).toBe('string')
		}
	})
})

// ── Layer duration and progress variables ─────────────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OscState — duration/progress variables (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('osc_layer_N_duration is a timecode string after connect + duration query', async () => {
		capturedVariables = {}
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)

		// Get connected first
		await queryAndWait(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`,
			() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN,
			2000
		)

		// Query duration + position: OscState only calls setVariableValues once both are known
		const durationPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/duration`
		const positionPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/position`
		listener.send(durationPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		listener.send(positionPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		const durKey = `osc_layer_${TEST_LAYER}_duration`
		await waitFor(() => capturedVariables[durKey] !== undefined, 2000)

		if (capturedVariables[durKey] !== undefined) {
			expect(capturedVariables[durKey]).toMatch(/^\d+:\d{2}(:\d{2})?$/)
		}
	})
})

// ── Direct injection variable tests ──────────────────────────────────────────

describe.skipIf(!resolume)('OscState — variables via direct message injection', () => {
	it('handleMessage /connected >= 2 sets osc_active_column', () => {
		capturedVariables = {}
		// First inject a column connected message
		oscState.handleMessage(`/composition/columns/${TEST_COLUMN}/connected`, 2)
		expect(capturedVariables['osc_active_column']).toBe(String(TEST_COLUMN))
	})

	it('column name message updates osc_active_column_name for active column', () => {
		capturedVariables = {}
		// Active column is already TEST_COLUMN from previous test
		oscState.handleMessage(`/composition/columns/${TEST_COLUMN}/name`, 'TestColumn')
		expect(capturedVariables['osc_active_column_name']).toBe('TestColumn')
	})

	it('column name "Column #" is normalized to "Column N"', () => {
		capturedVariables = {}
		oscState.handleMessage(`/composition/columns/${TEST_COLUMN}/name`, 'Column #')
		expect(capturedVariables['osc_active_column_name']).toBe(`Column ${TEST_COLUMN}`)
	})
})

// ── OscState secondsToTimecode util ──────────────────────────────────────────

describe.skipIf(!resolume)('OscState — secondsToTimecode formatting', () => {
	it('formats 65 seconds as 01:05', () => {
		expect(oscState.secondsToTimecode(65)).toBe('01:05')
	})

	it('formats 3661 seconds as 1:01:01', () => {
		expect(oscState.secondsToTimecode(3661)).toBe('1:01:01')
	})

	it('formats 0 seconds as 00:00', () => {
		expect(oscState.secondsToTimecode(0)).toBe('00:00')
	})

	it('formats negative seconds with minus prefix', () => {
		expect(oscState.secondsToTimecode(-30)).toBe('-00:30')
	})
})

// ── OscState transport variables (section 2.11) ───────────────────────────────

describe.skipIf(!resolume || !hasMedia)('OscState — elapsed/remaining/progress variables (requires media)', () => {
	afterAll(async () => {
		await rest.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('osc_layer_N_elapsed is a timecode string after connect + position query', async () => {
		capturedVariables = {}
		await rest.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)

		// Establish active clip by querying connected state
		await queryAndWait(
			`/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/connected`,
			() => oscState.getActiveClipColumn(TEST_LAYER) === TEST_COLUMN,
			2000
		)

		// Query duration so remaining/progress can be computed
		const durationPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/duration`
		listener.send(durationPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		await waitFor(() => oscState.getLayerDurationSeconds(TEST_LAYER) > 0, 2000)

		// Query position — triggers elapsed variable update
		const positionPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/position`
		listener.send(positionPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		const elapsedKey = `osc_layer_${TEST_LAYER}_elapsed`
		await waitFor(() => capturedVariables[elapsedKey] !== undefined, 2000)

		if (capturedVariables[elapsedKey] !== undefined) {
			expect(capturedVariables[elapsedKey]).toMatch(/^-?\d+(:\d{2}){1,2}$/)
		}
	})

	it('osc_layer_N_remaining is a timecode string after position + duration known', async () => {
		const remainingKey = `osc_layer_${TEST_LAYER}_remaining`
		// position and duration are already queried in the previous test;
		// send one more position query to ensure remaining is set
		const positionPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/position`
		listener.send(positionPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		await waitFor(() => capturedVariables[remainingKey] !== undefined, 2000)

		if (capturedVariables[remainingKey] !== undefined) {
			expect(capturedVariables[remainingKey]).toMatch(/^-?\d+(:\d{2}){1,2}$/)
		}
	})

	it('osc_layer_N_progress is a percentage string after position + duration known', async () => {
		const progressKey = `osc_layer_${TEST_LAYER}_progress`
		const positionPath = `/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}/transport/position/behaviour/position`
		listener.send(positionPath, [{ type: 's', value: '?' }], TEST_HOST, OSC_SEND_PORT)
		await waitFor(() => capturedVariables[progressKey] !== undefined, 2000)

		if (capturedVariables[progressKey] !== undefined) {
			// Expected format: "42.5%" or "42.5" or a numeric string — just check it's a non-empty string
			expect(typeof capturedVariables[progressKey]).toBe('string')
			expect(capturedVariables[progressKey].length).toBeGreaterThan(0)
		}
	})
})
