import { describe, it, expect, beforeEach } from 'vitest'
import { getActions } from '../../src/actions.js'
import { getApiFeedbacks } from '../../src/api-feedback.js'
import { getOscTransportFeedbacks } from '../../src/feedbacks/osc-transport/oscTransportFeedbacks.js'
import { configFields } from '../../src/config-fields.js'
import { compositionState, parameterStates } from '../../src/state.js'
import { makeModuleInstance } from './helpers/host-context.js'

/**
 * Structural checks over every action, feedback and config field the module registers,
 * guarding the rules of Companion module API 2.0 / 2.1.
 */

type Field = Record<string, any>

const AFFECTED_PROPERTIES = ['text', 'size', 'color', 'bgcolor', 'alignment', 'pngalignment', 'png64', 'imageBuffer']

function referencedOptionIds(expression: string): string[] {
	return [...expression.matchAll(/\$\(options:([^)]+)\)/g)].map((m) => m[1])
}

function build() {
	const { instance } = makeModuleInstance()
	const actions = getActions(instance) as Record<string, any>
	const feedbacks = { ...getApiFeedbacks(instance), ...getOscTransportFeedbacks(instance) } as Record<string, any>
	return { actions, feedbacks }
}

beforeEach(() => {
	compositionState.set(undefined)
	parameterStates.set({})
})

describe.each(['actions', 'feedbacks'] as const)('%s — option fields', (kind) => {
	const definitions = () => Object.entries(build()[kind]) as [string, { options: Field[] }][]

	it('registers definitions', () => {
		expect(definitions().length).toBeGreaterThan(40)
	})

	it('has no duplicate option ids within a definition', () => {
		for (const [id, definition] of definitions()) {
			const ids = definition.options.map((o) => o.id)
			expect(new Set(ids).size, `${kind}.${id}: ${ids.join(', ')}`).toBe(ids.length)
		}
	})

	it('uses isVisibleExpression instead of isVisible functions', () => {
		for (const [id, definition] of definitions()) {
			for (const option of definition.options) {
				expect(option, `${kind}.${id}.${option.id}`).not.toHaveProperty('isVisible')
				for (const [key, value] of Object.entries(option)) {
					expect(typeof value, `${kind}.${id}.${option.id}.${key}`).not.toBe('function')
				}
			}
		}
	})

	it('does not use the removed textinput "required" property', () => {
		for (const [id, definition] of definitions()) {
			for (const option of definition.options) {
				expect(option, `${kind}.${id}.${option.id}`).not.toHaveProperty('required')
			}
		}
	})

	it('only references existing, non-expression fields from isVisibleExpression', () => {
		let checked = 0
		for (const [id, definition] of definitions()) {
			const byId = new Map(definition.options.map((o) => [o.id, o]))
			for (const option of definition.options) {
				if (option.isVisibleExpression === undefined) continue
				expect(typeof option.isVisibleExpression).toBe('string')
				const referenced = referencedOptionIds(option.isVisibleExpression)
				expect(referenced.length, `${kind}.${id}.${option.id}`).toBeGreaterThan(0)
				for (const ref of referenced) {
					const target = byId.get(ref)
					expect(target, `${kind}.${id}.${option.id} references unknown option "${ref}"`).toBeDefined()
					expect(target!.disableAutoExpression, `${kind}.${id}: "${ref}" must set disableAutoExpression`).toBe(true)
					checked++
				}
			}
		}
		expect(checked).toBeGreaterThan(0)
	})
})

describe('actions — API 2.x rules', () => {
	it('declares optionsToMonitorForSubscribe whenever subscribe is used', () => {
		for (const [id, action] of Object.entries(build().actions)) {
			if (action.subscribe) {
				expect(Array.isArray(action.optionsToMonitorForSubscribe), `actions.${id}`).toBe(true)
			}
		}
	})
})

describe('feedbacks — API 2.x rules', () => {
	it('has no subscribe callbacks (removed in API 2.0)', () => {
		for (const [id, feedback] of Object.entries(build().feedbacks)) {
			expect(feedback, `feedbacks.${id}`).not.toHaveProperty('subscribe')
		}
	})

	it('declares affectedProperties on every advanced feedback (API 2.1)', () => {
		let advanced = 0
		for (const [id, feedback] of Object.entries(build().feedbacks)) {
			if (feedback.type !== 'advanced') continue
			advanced++
			expect(Array.isArray(feedback.affectedProperties), `feedbacks.${id}`).toBe(true)
			expect(feedback.affectedProperties.length, `feedbacks.${id}`).toBeGreaterThan(0)
			for (const property of feedback.affectedProperties) {
				expect(AFFECTED_PROPERTIES, `feedbacks.${id}`).toContain(property)
			}
		}
		expect(advanced).toBeGreaterThan(30)
	})

	it('has a callback on every feedback', () => {
		for (const [id, feedback] of Object.entries(build().feedbacks)) {
			expect(typeof feedback.callback, `feedbacks.${id}`).toBe('function')
		}
	})
})

describe('config fields', () => {
	it('has no duplicate ids', () => {
		const ids = configFields().map((f) => f.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('uses isVisibleExpression referencing existing config fields', () => {
		const fields = configFields() as Field[]
		const ids = new Set(fields.map((f) => f.id))
		let checked = 0
		for (const field of fields) {
			expect(field, field.id).not.toHaveProperty('isVisible')
			if (field.isVisibleExpression === undefined) continue
			for (const ref of referencedOptionIds(field.isVisibleExpression)) {
				expect(ids.has(ref), `${field.id} references unknown field "${ref}"`).toBe(true)
				checked++
			}
		}
		expect(checked).toBe(5)
	})
})
