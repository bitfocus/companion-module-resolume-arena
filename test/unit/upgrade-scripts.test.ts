import { describe, it, expect } from 'vitest'
import type { CompanionMigrationAction, CompanionMigrationFeedback, CompanionMigrationOptionValues } from '@companion-module/base'
import { getUpgradeScripts } from '../../src/upgrade-scripts.js'
import { upgrade_v1_0_4 } from '../../src/upgrade-scripts/upgrade_v1_0_4.js'
import { upgrade_v3_0_1 } from '../../src/upgrade-scripts/upgrade_v3_0_1.js'
import { upgrade_v3_5_2 } from '../../src/upgrade-scripts/upgrade_v3_5_2.js'
import { upgrade_v3_7_0 } from '../../src/upgrade-scripts/upgrade_v3_7_0.js'
import { upgrade_v3_10_0 } from '../../src/upgrade-scripts/upgrade_v3_10_0.js'
import { upgrade_v3_13_0 } from '../../src/upgrade-scripts/upgrade_v3_13_0.js'

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
