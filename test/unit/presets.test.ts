import { describe, it, expect, beforeEach } from 'vitest'
import { toPresetDefinitions, type CategorizedPresets } from '../../src/presets/preset-structure.js'
import { getApiPresets } from '../../src/api-presets.js'
import { getOscTransportPresets } from '../../src/presets/osc-transport/oscTransportPresets.js'
import { getActions } from '../../src/actions.js'
import { getApiFeedbacks } from '../../src/api-feedback.js'
import { getOscTransportFeedbacks } from '../../src/feedbacks/osc-transport/oscTransportFeedbacks.js'
import { compositionState, parameterStates } from '../../src/state.js'
import { makeModuleInstance } from './helpers/host-context.js'

function preset(category: string, name = 'Preset'): CategorizedPresets[string] {
	return {
		type: 'simple',
		category,
		name,
		style: { text: name, size: 'auto', color: 0xffffff, bgcolor: 0 },
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}
}

/** Every preset id referenced from a structure, in order. */
function referencedIds(structure: any[]): string[] {
	return structure.flatMap((section) =>
		section.definitions.flatMap((definition: any) => (typeof definition === 'string' ? [definition] : definition.presets))
	)
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

describe('toPresetDefinitions', () => {
	it('turns each category into a section, in order of first appearance', () => {
		const { structure } = toPresetDefinitions({ a: preset('Clip'), b: preset('Layer'), c: preset('Clip') })
		expect(structure).toEqual([
			{ id: 'clip', name: 'Clip', definitions: ['a', 'c'] },
			{ id: 'layer', name: 'Layer', definitions: ['b'] },
		])
	})

	it('returns simple presets without the category', () => {
		const { presets } = toPresetDefinitions({ a: preset('Clip', 'Trigger') })
		expect(presets.a).toEqual({
			type: 'simple',
			name: 'Trigger',
			style: { text: 'Trigger', size: 'auto', color: 0xffffff, bgcolor: 0 },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		})
	})

	it('turns "Section / Group" categories into groups within one section', () => {
		const { structure } = toPresetDefinitions({
			l1a: preset('OSC Transport / Layer 1'),
			l1b: preset('OSC Transport / Layer 1'),
			g1: preset('OSC Transport / Group 1'),
			comp: preset('OSC Transport / Composition'),
		})
		expect(structure).toEqual([
			{
				id: 'osc-transport',
				name: 'OSC Transport',
				definitions: [
					{ id: 'osc-transport-layer-1', type: 'simple', name: 'Layer 1', presets: ['l1a', 'l1b'] },
					{ id: 'osc-transport-group-1', type: 'simple', name: 'Group 1', presets: ['g1'] },
					{ id: 'osc-transport-composition', type: 'simple', name: 'Composition', presets: ['comp'] },
				],
			},
		])
	})

	it('puts ungrouped presets of a grouped section in an unnamed group', () => {
		const { structure } = toPresetDefinitions({ a: preset('Mixed'), b: preset('Mixed / Sub') })
		expect(structure[0].definitions).toEqual([
			{ id: 'mixed-general', type: 'simple', name: '', presets: ['a'] },
			{ id: 'mixed-sub', type: 'simple', name: 'Sub', presets: ['b'] },
		])
	})

	it('returns an empty structure for no presets', () => {
		expect(toPresetDefinitions({})).toEqual({ structure: [], presets: {} })
	})
})

describe('module presets (API 2.x structure)', () => {
	const all = () => ({ ...getApiPresets('arena'), ...getOscTransportPresets('arena', new Set([11])) })

	it('only defines simple presets', () => {
		const presets = Object.entries(all())
		expect(presets.length).toBeGreaterThan(100)
		for (const [id, definition] of presets) {
			expect(definition.type, id).toBe('simple')
		}
	})

	it('references every preset exactly once from the structure', () => {
		const { structure, presets } = toPresetDefinitions(all())
		const referenced = referencedIds(structure)
		expect(new Set(referenced).size).toBe(referenced.length)
		expect([...referenced].sort()).toEqual(Object.keys(presets).sort())
	})

	it('has unique section and group ids', () => {
		const { structure } = toPresetDefinitions(all())
		const ids = structure.flatMap((section) => [
			section.id,
			...section.definitions.flatMap((definition: any) => (typeof definition === 'string' ? [] : [definition.id])),
		])
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('lists the expected sections', () => {
		const { structure } = toPresetDefinitions(all())
		expect(structure.map((section) => section.name)).toEqual([
			'Clip',
			'Column',
			'Composition',
			'Deck',
			'Effect',
			'Layer',
			'Layer Group',
			'OSC Transport',
		])
	})

	it('groups the OSC transport presets per layer, group and composition', () => {
		const { structure } = toPresetDefinitions(all())
		const osc = structure.find((section) => section.name === 'OSC Transport')!
		const names = osc.definitions.map((definition: any) => definition.name)
		expect(names).toEqual([
			...Array.from({ length: 11 }, (_, i) => `Layer ${i + 1}`),
			'Group 1',
			'Group 2',
			'Group 3',
			'Composition',
		])
	})

	it('only uses actions and feedbacks the module defines', () => {
		const { instance } = makeModuleInstance()
		const actionIds = new Set(Object.keys(getActions(instance)))
		const feedbackIds = new Set(Object.keys({ ...getApiFeedbacks(instance), ...getOscTransportFeedbacks(instance) }))
		for (const [id, definition] of Object.entries(all())) {
			for (const step of definition.steps) {
				for (const action of [...step.down, ...step.up]) {
					expect(actionIds.has(action.actionId as string), `${id}: action ${String(action.actionId)}`).toBe(true)
				}
			}
			for (const feedback of definition.feedbacks) {
				expect(feedbackIds.has(feedback.feedbackId as string), `${id}: feedback ${String(feedback.feedbackId)}`).toBe(true)
			}
		}
	})
})

describe('ResolumeArenaModuleInstance.setupPresets', () => {
	it('registers structure and presets with the host', () => {
		const { instance, host } = makeModuleInstance('my-arena')
		;(instance as any).config = { port: 7000 }
		instance.restApi = {} as any
		instance.setupPresets()

		expect(host.setPresetDefinitions).toHaveBeenCalledTimes(1)
		const [structure, presets] = host.setPresetDefinitions.mock.calls[0]
		expect(structure.map((section: any) => section.name)).toContain('OSC Transport')
		expect(structure.map((section: any) => section.name)).toContain('Layer')
		expect(referencedIds(structure).sort()).toEqual(Object.keys(presets).sort())
		for (const definition of Object.values<any>(presets)) {
			expect(definition).not.toHaveProperty('category')
		}
		expect(presets.layerTimerElapsed.style.text).toBe('$(my-arena:ws_layer_1_elapsed)')
	})

	it('only registers the OSC transport section without the REST api', () => {
		const { instance, host } = makeModuleInstance()
		;(instance as any).config = { port: 7000 }
		instance.restApi = null
		instance.setupPresets()
		const [structure] = host.setPresetDefinitions.mock.calls[0]
		expect(structure.map((section: any) => section.name)).toEqual(['OSC Transport'])
	})
})
