import { describe, it, expect } from 'vitest'
import type { CompanionMigrationAction, CompanionMigrationFeedback, CompanionMigrationOptionValues } from '@companion-module/base'
import { getUpgradeScripts } from '../../src/upgrade-scripts.js'
import { upgrade_v1_0_4 } from '../../src/upgrade-scripts/upgrade_v1_0_4.js'
import { upgrade_v3_0_1 } from '../../src/upgrade-scripts/upgrade_v3_0_1.js'
import { upgrade_v3_5_2 } from '../../src/upgrade-scripts/upgrade_v3_5_2.js'
import { upgrade_v3_7_0 } from '../../src/upgrade-scripts/upgrade_v3_7_0.js'
import { upgrade_v3_10_0 } from '../../src/upgrade-scripts/upgrade_v3_10_0.js'
import { upgrade_v3_13_0 } from '../../src/upgrade-scripts/upgrade_v3_13_0.js'
import { upgrade_v4_0_0 } from '../../src/upgrade-scripts/upgrade_v4_0_0.js'

// API 2.x hands upgrade scripts every option wrapped as { isExpression, value }
const value = (v: string | number | boolean) => ({ isExpression: false as const, value: v })
const expression = (v: string) => ({ isExpression: true as const, value: v })

const action = (actionId: string, options: CompanionMigrationOptionValues): CompanionMigrationAction => ({
	id: 'a1',
	controlId: 'c1',
	actionId,
	options,
})

const feedback = (feedbackId: string, options: CompanionMigrationOptionValues): CompanionMigrationFeedback => ({
	id: 'f1',
	controlId: 'c1',
	feedbackId,
	options,
})

const context = { currentConfig: {} } as any
const props = (actions: CompanionMigrationAction[], feedbacks: CompanionMigrationFeedback[] = []) => ({
	config: null,
	secrets: null,
	actions,
	feedbacks,
})

describe('getUpgradeScripts', () => {
	it('returns the scripts in release order', () => {
		expect(getUpgradeScripts()).toEqual([
			upgrade_v1_0_4,
			upgrade_v3_0_1,
			upgrade_v3_5_2,
			upgrade_v3_7_0,
			upgrade_v3_10_0,
			upgrade_v3_13_0,
			upgrade_v4_0_0,
		])
	})

	it('never touches config or secrets', () => {
		for (const script of getUpgradeScripts()) {
			const result = script(context, props([]))
			expect(result.updatedConfig).toBeNull()
			expect(result.updatedSecrets).toBeNull()
		}
	})
})

describe('upgrade_v1_0_4', () => {
	it('moves customCmd to customPath, keeping the wrapped value', () => {
		const result = upgrade_v1_0_4(context, props([action('custom', { customCmd: value('/composition/tempo') })]))
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options).toEqual({ customPath: value('/composition/tempo') })
	})

	it('keeps an expression intact when moving it', () => {
		const result = upgrade_v1_0_4(context, props([action('custom', { customCmd: expression('$(internal:custom_path)') })]))
		expect(result.updatedActions[0].options).toEqual({ customPath: expression('$(internal:custom_path)') })
	})

	it('ignores other actions', () => {
		const result = upgrade_v1_0_4(context, props([action('other', { customCmd: value('x') })]))
		expect(result.updatedActions).toHaveLength(0)
	})
})

describe('upgrade_v3_0_1', () => {
	it('adds a wrapped default relativeType', () => {
		const result = upgrade_v3_0_1(context, props([action('custom', { customPath: value('/x') })]))
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options.relativeType).toEqual(value('n'))
	})

	it('leaves an existing relativeType alone', () => {
		const result = upgrade_v3_0_1(context, props([action('custom', { relativeType: value('+') })]))
		expect(result.updatedActions).toHaveLength(0)
	})
})

describe('upgrade_v3_5_2', () => {
	it('adds wrapped default colours to connectedClip', () => {
		const result = upgrade_v3_5_2(context, props([], [feedback('connectedClip', { layer: value('1') })]))
		expect(result.updatedFeedbacks.length).toBeGreaterThan(0)
		expect(result.updatedFeedbacks[0].options).toEqual({
			layer: value('1'),
			color_connected: value('rgb(0, 255, 0)'),
			color_connected_selected: value('rgb(0, 255, 255)'),
			color_connected_preview: value('rgb(255, 255, 0)'),
			color_preview: value('rgb(255, 0, 0)'),
		})
	})

	it('keeps colours that are already set', () => {
		const existing = {
			color_connected: value(123),
			color_connected_selected: value(456),
			color_connected_preview: value(789),
			color_preview: value(1),
		}
		const result = upgrade_v3_5_2(context, props([], [feedback('connectedClip', { ...existing })]))
		expect(result.updatedFeedbacks).toHaveLength(0)
	})
})

describe('upgrade_v3_7_0', () => {
	it('divides a plain layerTransitionDurationChange value by 100', () => {
		const result = upgrade_v3_7_0(context, props([action('layerTransitionDurationChange', { value: value(150) })]))
		expect(result.updatedActions[0].options.value).toEqual(value(1.5))
	})

	it('divides a numeric string value by 100', () => {
		const result = upgrade_v3_7_0(context, props([action('layerTransitionDurationChange', { value: value('250') })]))
		expect(result.updatedActions[0].options.value).toEqual(value(2.5))
	})

	it('wraps an expression instead of evaluating it', () => {
		const result = upgrade_v3_7_0(context, props([action('layerTransitionDurationChange', { value: expression('$(local:duration)') })]))
		expect(result.updatedActions[0].options.value).toEqual(expression('($(local:duration)) / 100'))
	})

	it('does not change the value of other actions', () => {
		const result = upgrade_v3_7_0(context, props([action('layerOpacityChange', { value: value(150) })]))
		expect(result.updatedActions[0].options.value).toEqual(value(150))
	})
})

describe('upgrade_v3_10_0', () => {
	it('renames the column name feedbacks', () => {
		const result = upgrade_v3_10_0(
			context,
			props(
				[],
				[
					feedback('nextColumnName', {}),
					feedback('previousColumnName', {}),
					feedback('nextLayerGroupColumnName', {}),
					feedback('previousLayerGroupColumnName', {}),
				]
			)
		)
		expect(result.updatedFeedbacks.map((f) => f.feedbackId)).toEqual([
			'nextSelectedColumnName',
			'previousSelectedColumnName',
			'nextSelectedLayerGroupColumnName',
			'previousSelectedLayerGroupColumnName',
		])
	})

	it('renames the trigger column actions', () => {
		const result = upgrade_v3_10_0(context, props([action('triggerColumn', {}), action('triggerLayerGroupColumn', {})]))
		expect(result.updatedActions.map((a) => a.actionId)).toEqual(['connectColumn', 'connectLayerGroupColumn'])
	})
})

describe('upgrade_v3_13_0', () => {
	it('renames custom to oscCustomCommand', () => {
		const result = upgrade_v3_13_0(context, props([action('custom', { customPath: value('/x') })]))
		expect(result.updatedActions[0].actionId).toBe('oscCustomCommand')
		expect(result.updatedActions[0].options).toEqual({ customPath: value('/x') })
	})

	it('adds a wrapped default lookupMode to connectColumn', () => {
		const result = upgrade_v3_13_0(context, props([action('connectColumn', { column: value('1') })]))
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options.lookupMode).toEqual(value('byIndex'))
	})

	it('leaves an existing lookupMode alone', () => {
		const result = upgrade_v3_13_0(context, props([action('connectColumn', { lookupMode: value('byName') })]))
		expect(result.updatedActions).toHaveLength(0)
	})
})

describe('upgrade_v4_0_0 — connectedClip colours', () => {
	// Companion 5 skips a feedback whose number colorpicker holds a CSS string, which removed the
	// coloured border that marks the active clip.
	it('converts CSS colour strings to colour numbers', () => {
		const result = upgrade_v4_0_0(
			context,
			props(
				[],
				[
					feedback('connectedClip', {
						layer: value('1'),
						column: value('2'),
						color_connected: value('rgb(0, 255, 0)'),
						color_connected_selected: value('rgb(0,255,255)'),
						color_connected_preview: value('rgb(255, 255, 0)'),
						color_preview: value('rgb(255, 0, 0)'),
					}),
				]
			)
		)
		expect(result.updatedFeedbacks).toHaveLength(1)
		expect(result.updatedFeedbacks[0].options).toEqual({
			layer: value('1'),
			column: value('2'),
			color_connected: value(0x00ff00),
			color_connected_selected: value(0x00ffff),
			color_connected_preview: value(0xffff00),
			color_preview: value(0xff0000),
		})
	})

	it('understands hex colours and numeric strings', () => {
		const result = upgrade_v4_0_0(
			context,
			props([], [feedback('connectedClip', { color_connected: value('#ff8000'), color_preview: value('#0f0'), color_connected_preview: value('65280') })])
		)
		expect(result.updatedFeedbacks[0].options).toEqual({
			color_connected: value(0xff8000),
			color_preview: value(0x00ff00),
			color_connected_preview: value(65280),
		})
	})

	it('leaves colour numbers and expressions alone', () => {
		const options = { color_connected: value(65280), color_preview: expression('$(local:colour)') }
		const result = upgrade_v4_0_0(context, props([], [feedback('connectedClip', { ...options })]))
		expect(result.updatedFeedbacks).toHaveLength(0)
	})

	it('leaves a string it cannot read as a colour alone', () => {
		const result = upgrade_v4_0_0(context, props([], [feedback('connectedClip', { color_connected: value('not a colour') })]))
		expect(result.updatedFeedbacks).toHaveLength(0)
	})

	it('does not touch other feedbacks', () => {
		const result = upgrade_v4_0_0(context, props([], [feedback('oscActiveColumn', { bg_active: value('rgb(0, 255, 0)') })]))
		expect(result.updatedFeedbacks).toHaveLength(0)
	})
})

describe('upgrade_v4_0_0 — parseVariables() text left in plain option values', () => {
	// A plain (non-expression) value holding the text parseVariables("...") can never match the number
	// regex of the layer/column fields, so Companion skips the action. Restore the variable text.
	it('unwraps it for actions', () => {
		const result = upgrade_v4_0_0(
			context,
			props([action('triggerClip', { layer: value('3'), column: value('parseVariables("$(internal:custom_col1)")') })])
		)
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].options).toEqual({ layer: value('3'), column: value('$(internal:custom_col1)') })
	})

	it('unwraps it for feedbacks, restoring escaped characters', () => {
		const result = upgrade_v4_0_0(
			context,
			props([], [feedback('clipInfo', { layer: value('parseVariables("$(arena:selectedClipLayer)")'), column: value('parseVariables("a \\"b\\" \\\\ c")') })])
		)
		expect(result.updatedFeedbacks[0].options).toEqual({ layer: value('$(arena:selectedClipLayer)'), column: value('a "b" \\ c') })
	})

	it('keeps real expressions as they are', () => {
		const result = upgrade_v4_0_0(
			context,
			props([action('triggerClip', { layer: expression('parseVariables("$(internal:custom_layer1)")'), column: value('2') })])
		)
		expect(result.updatedActions).toHaveLength(0)
	})

	it('does not report untouched actions and feedbacks', () => {
		const result = upgrade_v4_0_0(context, props([action('triggerClip', { layer: value('1'), column: value('$(internal:custom_col1)') })], [feedback('clipInfo', { layer: value(1) })]))
		expect(result.updatedActions).toHaveLength(0)
		expect(result.updatedFeedbacks).toHaveLength(0)
	})
})

describe('upgrade_v4_0_0 — Resync Tempo buttons made from the old preset', () => {
	// The preset used the action id `tempoResync`, which never existed; the action is `resyncTap`.
	it('points them at the existing action', () => {
		const result = upgrade_v4_0_0(context, props([action('tempoResync', {})]))
		expect(result.updatedActions).toHaveLength(1)
		expect(result.updatedActions[0].actionId).toBe('resyncTap')
	})

	it('leaves resyncTap and tempoTap alone', () => {
		const result = upgrade_v4_0_0(context, props([action('resyncTap', {}), action('tempoTap', {})]))
		expect(result.updatedActions).toHaveLength(0)
	})
})
