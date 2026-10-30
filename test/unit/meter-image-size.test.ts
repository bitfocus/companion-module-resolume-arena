import { describe, it, expect, beforeEach } from 'vitest'
import { getApiFeedbacks } from '../../src/api-feedback.js'
import { drawPercentage, drawVolume } from '../../src/image-utils.js'
import { compositionState, parameterStates } from '../../src/state.js'
import { makeModuleInstance } from './helpers/host-context.js'

/**
 * Companion draws a feedback image buffer over the button's image area and rejects a buffer whose
 * size does not match it ("Pixelbuffer for a 72x58 image should be either 12528 or 16704 bytes").
 * The meters therefore have to be drawn at the size Companion passes in `feedback.image`.
 */

const decodedLength = (imageBuffer: unknown) => Buffer.from(String(imageBuffer), 'base64').length

describe('meter bitmaps', () => {
	it('default to a 72×72 image', () => {
		expect(decodedLength(drawPercentage(0.5))).toBe(72 * 72 * 4)
		expect(decodedLength(drawVolume(-6))).toBe(72 * 72 * 4)
	})

	it('are drawn at the requested image size', () => {
		expect(decodedLength(drawPercentage(0.5, { width: 72, height: 58 }))).toBe(72 * 58 * 4)
		expect(decodedLength(drawPercentage(1.5, { width: 72, height: 58 }))).toBe(72 * 58 * 4)
		expect(decodedLength(drawVolume(-6, 0, { width: 96, height: 96 }))).toBe(96 * 96 * 4)
	})
})

describe('meter feedbacks draw at the size of the button image area', () => {
	const METERS: Record<string, Record<string, string>> = {
		compositionMaster: {},
		compositionVolume: {},
		compositionOpacity: {},
		compositionSpeed: {},
		layerMaster: { layer: '1' },
		layerVolume: { layer: '1' },
		layerOpacity: { layer: '1' },
		layerTransitionDuration: { layer: '1' },
		layerGroupMaster: { layerGroup: '1' },
		layerGroupVolume: { layerGroup: '1' },
		layerGroupOpacity: { layerGroup: '1' },
		layerGroupSpeed: { layerGroup: '1' },
		clipVolume: { layer: '1', column: '1' },
		clipOpacity: { layer: '1', column: '1' },
		clipSpeed: { layer: '1', column: '1' },
	}

	beforeEach(() => {
		compositionState.set(undefined)
		const states: Record<string, { value: number }> = {}
		for (const path of [
			'/composition/master',
			'/composition/audio/volume',
			'/composition/video/opacity',
			'/composition/speed',
			'/composition/layers/1/master',
			'/composition/layers/1/audio/volume',
			'/composition/layers/1/video/opacity',
			'/composition/groups/1/master',
			'/composition/groups/1/audio/volume',
			'/composition/groups/1/video/opacity',
			'/composition/groups/1/speed',
			'/composition/layers/1/clips/1/audio/volume',
			'/composition/layers/1/clips/1/video/opacity',
			'/composition/layers/1/clips/1/transport/position/behaviour/speed',
		]) {
			states[path] = { value: 0.5 }
		}
		parameterStates.set(states as any)
	})

	it.each(Object.entries(METERS))('%s', async (feedbackId, options) => {
		const { instance } = makeModuleInstance()
		instance.restApi = { Layers: { getSettings: async () => ({ transition: { duration: { value: 0.5 } } }) } } as any
		const definition = (getApiFeedbacks(instance) as Record<string, any>)[feedbackId]
		expect(definition.type).toBe('advanced')

		for (const image of [
			{ width: 72, height: 58 }, // button with the top bar shown
			{ width: 72, height: 72 },
		]) {
			const result = await definition.callback(
				{ id: `fb-${feedbackId}`, controlId: 'c', feedbackId, type: 'advanced', options, previousOptions: null, image },
				{ type: 'feedback' }
			)
			expect(typeof result.imageBuffer, feedbackId).toBe('string')
			expect(decodedLength(result.imageBuffer), `${feedbackId} at ${image.width}x${image.height}`).toBe(image.width * image.height * 4)
		}
	})
})
