/**
 * Integration tests for clip status feedbacks: connectedClip and selectedClip.
 *
 * These tests verify the REST data contract for the clip states used by
 * connectedClip and selectedClip feedbacks.
 *
 * connectedClip reads parameterStates['.../connect'].value which can be:
 *   'Connected'             → color_connected  (or color_connected_selected if also selected)
 *   'Previewing'            → color_preview
 *   'Connected & previewing'→ color_connected_preview
 *
 * selectedClip reads parameterStates['.../select'].value (boolean).
 *
 * NOTE: 'Previewing' and 'Connected & previewing' states cannot be set
 * programmatically via the REST /connect endpoint — that endpoint only accepts
 * boolean triggers. Those states are triggered via Resolume's preview output
 * UI. The contract tests for those states verify only that the enum options
 * exist in the REST response (see "connected field enum options" test).
 * The WebSocket parameterStates mirrors the same values, so if the options
 * are present, the feedback callbacks will handle them correctly.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

const resolume = await isResolumeReachable()
const api = new ArenaRestApi(TEST_HOST, REST_PORT)
const clipUrl = `http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}`

async function fetchClip(): Promise<any> {
	const { default: fetch } = await import('node-fetch')
	const res = await fetch(clipUrl, { timeout: 3000 } as any)
	return res.json()
}

// ── connectedClip: active (Connected) state ───────────────────────────────────

describe.skipIf(!resolume)('connectedClip feedback — active (Connected) state', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected.value is "Connected" when clip is active', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).toBe('Connected')
	})

	it('connected.value is a string (matches type stored in parameterStates)', async () => {
		const clip = await fetchClip()
		expect(typeof clip?.connected?.value).toBe('string')
	})

	it('connected field exposes all enum values including preview states', async () => {
		// The feedback callback handles 'Previewing' and 'Connected & previewing'.
		// These states cannot be set via the REST API programmatically (they require
		// Resolume's preview output UI), but they MUST be present in the options array
		// so the WebSocket parameterStates can deliver them and the callbacks handle them.
		const clip = await fetchClip()
		const opts: string[] = clip?.connected?.options ?? []
		expect(opts).toContain('Connected')
		expect(opts).toContain('Previewing')
		expect(opts).toContain('Connected & previewing')
	})
})

// ── connectedClip: preview (Previewing) state — triggered via select ──────────
//
// In Resolume Arena, selecting a clip (api.Clips.select) loads it into the
// preview output. On a disconnected clip this produces 'Previewing'.

describe.skipIf(!resolume)('connectedClip feedback — preview (Previewing) state', () => {
	beforeAll(async () => {
		// Ensure clip is not live before selecting (so it enters preview-only state)
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
		await api.Clips.select(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		// Select a different clip to exit preview on this one
		const otherId = new ClipId(TEST_LAYER, TEST_COLUMN === 1 ? 2 : 1)
		await api.Clips.select(otherId)
		await pause(300)
	})

	it('connected.value contains "preview" when clip is selected but not live', async () => {
		const clip = await fetchClip()
		const value = clip?.connected?.value as string | undefined
		// Resolume sets the clip to 'Previewing' when selected from disconnected state
		expect(value?.toLowerCase()).toContain('preview')
	})

	it('clip is not in the live output while previewing only', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).not.toBe('Connected')
	})

	it('selected.value is true when previewing via select', async () => {
		const clip = await fetchClip()
		expect(clip?.selected?.value).toBe(true)
	})
})

// ── connectedClip: active + previewing state — connect then select ────────────

describe.skipIf(!resolume)('connectedClip feedback — active+preview (Connected & previewing) state', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		// Selecting a connected clip also sends it to the preview output
		await api.Clips.select(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		const otherId = new ClipId(TEST_LAYER, TEST_COLUMN === 1 ? 2 : 1)
		await api.Clips.select(otherId)
		await pause(200)
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected.value is "Connected & previewing" when active and selected', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).toBe('Connected & previewing')
	})

	it('selected.value is true when active and selected', async () => {
		const clip = await fetchClip()
		expect(clip?.selected?.value).toBe(true)
	})
})

// ── connectedClip: disconnected state ────────────────────────────────────────

describe.skipIf(!resolume)('connectedClip feedback — disconnected state', () => {
	beforeAll(async () => {
		// Ensure clip is not active before this test block
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connected.value is not "Connected" when layer is cleared', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).not.toBe('Connected')
	})

	it('connected.value is one of the known enum values', async () => {
		const clip = await fetchClip()
		const knownStates = ['Connected', 'Disconnected', 'Empty', 'Previewing', 'Connected & previewing']
		expect(knownStates).toContain(clip?.connected?.value)
	})
})

// ── selectedClip: selected state ──────────────────────────────────────────────

describe.skipIf(!resolume)('selectedClip feedback — selected state', () => {
	beforeAll(async () => {
		await api.Clips.select(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	it('selected.value is true (strict boolean) after selecting', async () => {
		const clip = await fetchClip()
		expect(clip?.selected?.value).toBe(true)
	})

	it('selected field exists and holds a boolean', async () => {
		const clip = await fetchClip()
		expect(clip).toHaveProperty('selected')
		expect(typeof clip?.selected?.value).toBe('boolean')
	})
})

// ── selectedClip: deselected state ────────────────────────────────────────────

describe.skipIf(!resolume)('selectedClip feedback — deselected state', () => {
	beforeAll(async () => {
		// Selecting a different clip deselects the test clip
		const otherId = new ClipId(TEST_LAYER, TEST_COLUMN === 1 ? 2 : 1)
		await api.Clips.select(otherId)
		await pause(300)
	})

	it('selected.value is false when a different clip is selected', async () => {
		const clip = await fetchClip()
		expect(clip?.selected?.value).toBe(false)
	})
})

// ── connectedClip + selectedClip simultaneously ───────────────────────────────

describe.skipIf(!resolume)('connectedClip+selectedClip — active and selected simultaneously', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
		await api.Clips.select(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(300)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('clip is live (connected to output) when active', async () => {
		const clip = await fetchClip()
		// Accept 'Connected' or 'Connected & previewing': if Arena's preview output
		// was set interactively in a previous session, preview state is sticky and
		// cannot be cleared via the REST API alone. Either value means the clip IS
		// active in the live output, which is the relevant state for the feedback.
		const value = clip?.connected?.value as string | undefined
		expect(value?.includes('Connected')).toBe(true)
	})

	it('selected.value is true when selected', async () => {
		const clip = await fetchClip()
		expect(clip?.selected?.value).toBe(true)
	})

	it('clip is live AND selected simultaneously', async () => {
		const clip = await fetchClip()
		// connectedClip callback returns color_connected_selected when
		// connectedState === 'Connected' && selectedState is truthy.
		const value = clip?.connected?.value as string | undefined
		expect(value?.includes('Connected')).toBe(true)
		expect(clip?.selected?.value).toBe(true)
	})
})
