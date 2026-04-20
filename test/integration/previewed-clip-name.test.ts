/**
 * previewedClipName variable data-pipeline tests (issue #142).
 *
 * The variable is populated inside clipConnectedFeedbackCallback, which reads
 * the clip name from parameterStates. The fix (co-subscribing /name alongside
 * /connect) ensures the name is available regardless of whether a separate
 * clipDetails feedback is configured.
 *
 * These tests verify the REST data contract that drives the variable:
 * - The /connect field exists and returns the expected string values
 * - The /name field is readable alongside /connect in the same clip object
 * - When a clip is connected, both fields are non-empty
 *
 * We cannot assert the Companion variable value directly (requires a live
 * module instance), so we validate the underlying API surface.
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

// ── connect field data contract ───────────────────────────────────────────────

describe.skipIf(!resolume)('previewedClipName — connect field data contract', () => {
	it('clip at TEST_LAYER/TEST_COLUMN has a connect field', async () => {
		const clip = await fetchClip()
		expect(clip).toHaveProperty('connected')
	})

	it('connect field has a string value property', async () => {
		const clip = await fetchClip()
		expect(typeof clip?.connected?.value).toBe('string')
	})

	it('connect field options include "Previewing" and "Connected & previewing"', async () => {
		const clip = await fetchClip()
		const options: string[] = clip?.connected?.options ?? []
		expect(options).toContain('Previewing')
		expect(options).toContain('Connected & previewing')
	})
})

// ── name and connect co-presence ─────────────────────────────────────────────

describe.skipIf(!resolume)('previewedClipName — name available alongside connect', () => {
	it('clip REST response contains both connected and name fields', async () => {
		const clip = await fetchClip()
		expect(clip).toHaveProperty('connected')
		expect(clip).toHaveProperty('name')
	})

	it('name.value is a string (not undefined) when clip is idle', async () => {
		const clip = await fetchClip()
		expect(typeof clip?.name?.value).toBe('string')
	})
})

// ── name present while clip is connected ─────────────────────────────────────

describe.skipIf(!resolume)('previewedClipName — name readable while clip is connected', () => {
	beforeAll(async () => {
		await api.Clips.connect(new ClipId(TEST_LAYER, TEST_COLUMN))
		await pause(400)
	})

	afterAll(async () => {
		await api.Layers.clear(TEST_LAYER)
		await pause(300)
	})

	it('connect value is "Connected" after connecting the clip', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).toBe('Connected')
	})

	it('name.value is a non-empty string while the clip is connected', async () => {
		const clip = await fetchClip()
		expect(typeof clip?.name?.value).toBe('string')
		expect((clip?.name?.value as string).length).toBeGreaterThan(0)
	})

	it('both name and connected are present in the same REST response', async () => {
		const clip = await fetchClip()
		expect(clip?.connected?.value).toBeDefined()
		expect(clip?.name?.value).toBeDefined()
	})
})
