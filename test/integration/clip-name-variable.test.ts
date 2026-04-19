/**
 * clip_name_l{layer}_c{column} variable data-pipeline tests (issue #151).
 *
 * The variable is driven by websocket messages on:
 *   /composition/layers/{layer}/clips/{column}/name
 *
 * These tests verify that the Resolume REST state that populates the variable
 * is correct. We cannot assert the Companion variable value directly (requires
 * a live module instance), so we assert the REST state that drives it.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import ArenaRestApi from '../../src/arena-api/rest'
import { ClipId } from '../../src/domain/clip/clip-id'
import { TEST_HOST, REST_PORT, TEST_LAYER, TEST_COLUMN } from './config'
import { isResolumeReachable, pause } from './helpers'

const resolume = await isResolumeReachable()

const api = new ArenaRestApi(TEST_HOST, REST_PORT)
const clipUrl = `http://${TEST_HOST}:${REST_PORT}/api/v1/composition/layers/${TEST_LAYER}/clips/${TEST_COLUMN}`

async function putClip(body: any): Promise<void> {
	const { default: fetch } = await import('node-fetch')
	await fetch(clipUrl, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		timeout: 3000,
	} as any)
}

// ── Clip name structure ───────────────────────────────────────────────────────

describe.skipIf(!resolume)('clip name var — REST data contract', () => {
	it('clip at TEST_LAYER/TEST_COLUMN has a name field with a string value', async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(clip).toHaveProperty('name')
		expect(typeof clip.name.value).toBe('string')
	})

	it('composition endpoint exposes clip name at layers[n].clips[m].name.value', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, { timeout: 3000 } as any)
		expect(res.ok).toBe(true)
		const data = (await res.json()) as any
		const clip = data?.layers?.[TEST_LAYER - 1]?.clips?.[TEST_COLUMN - 1]
		expect(clip).toBeDefined()
		expect(typeof clip?.name?.value).toBe('string')
	})
})

// ── Clip name update roundtrip ────────────────────────────────────────────────

describe.skipIf(!resolume)('clip name var — name update roundtrip', () => {
	let originalName: string

	beforeAll(async () => {
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		originalName = clip?.name?.value ?? ''
	})

	afterAll(async () => {
		await putClip({ name: { value: originalName } })
		await pause(200)
	})

	it('updating clip name via REST is reflected back on read', async () => {
		await putClip({ name: { value: 'ClipNameVarTest' } })
		await pause(200)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(clip?.name?.value).toBe('ClipNameVarTest')
	})

	it('clip name update is also reflected in the composition endpoint', async () => {
		await putClip({ name: { value: 'CompStateTest' } })
		await pause(200)
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, { timeout: 3000 } as any)
		const data = (await res.json()) as any
		const clip = data?.layers?.[TEST_LAYER - 1]?.clips?.[TEST_COLUMN - 1]
		expect(clip?.name?.value).toBe('CompStateTest')
	})

	it('can restore original clip name', async () => {
		await putClip({ name: { value: originalName } })
		await pause(200)
		const clip = (await api.Clips.getStatus(new ClipId(TEST_LAYER, TEST_COLUMN))) as any
		expect(clip?.name?.value).toBe(originalName)
	})
})

// ── Grid shape ────────────────────────────────────────────────────────────────

describe.skipIf(!resolume)('clip name var — composition grid shape', () => {
	it('composition has at least one layer with at least one clip', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, { timeout: 3000 } as any)
		const data = (await res.json()) as any
		expect(Array.isArray(data?.layers)).toBe(true)
		expect(data.layers.length).toBeGreaterThan(0)
		expect(Array.isArray(data.layers[0]?.clips)).toBe(true)
		expect(data.layers[0].clips.length).toBeGreaterThan(0)
	})

	it('every clip in the composition has a name field', async () => {
		const { default: fetch } = await import('node-fetch')
		const res = await fetch(`http://${TEST_HOST}:${REST_PORT}/api/v1/composition`, { timeout: 3000 } as any)
		const data = (await res.json()) as any
		for (const layer of data?.layers ?? []) {
			for (const clip of layer?.clips ?? []) {
				expect(clip).toHaveProperty('name')
				expect(typeof clip.name.value).toBe('string')
			}
		}
	})

	it('clips in different grid positions have distinct websocket name paths', async () => {
		const path1 = `/composition/layers/1/clips/1/name`
		const path2 = `/composition/layers/1/clips/2/name`
		const path3 = `/composition/layers/2/clips/1/name`
		expect(path1).not.toBe(path2)
		expect(path1).not.toBe(path3)
	})
})
