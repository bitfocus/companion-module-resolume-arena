import {SomeCompanionFeedbackInputField, Regex} from '@companion-module/base';
import {EffectUtils, EffectScope, EffectCollection, MANUAL_EFFECT_CHOICE, MANUAL_PARAM_CHOICE} from '../../domain/effects/effect-utils.js';

const COLLECTIONS: EffectCollection[] = ['params', 'mixer', 'effect'];

/**
 * Builds options for an effect action or feedback for the given scope.
 *
 * For composition/layergroup/layer: always shows a dynamic effect dropdown.
 * For clip: shows manual inputs only by default. Pass withClipList=true to
 * include the full clip-effects dropdown (only suitable for small compositions).
 */
export function buildScopedEffectOptions(eu: EffectUtils, scope: EffectScope, withClipList = false): SomeCompanionFeedbackInputField[] {
	const showDropdown = scope !== 'clip' || withClipList;
	const fields: SomeCompanionFeedbackInputField[] = [];

	if (showDropdown) {
		const allChoices = eu.buildEffectChoices(scope === 'clip');
		const prefix = `${scope}:`;
		const filtered = allChoices.filter((c) => c.id === MANUAL_EFFECT_CHOICE || String(c.id).startsWith(prefix));
		fields.push({
			id: 'effectChoice',
			type: 'dropdown',
			label: 'Effect — select from loaded effects or choose Manual to enter an index',
			choices: filtered,
			default: MANUAL_EFFECT_CHOICE,
			// Referenced by isVisibleExpression below, so it cannot be an expression itself
			disableAutoExpression: true,
			// The choices follow the loaded composition; without this Companion skips the action/feedback
			// whenever the stored effect is not in the current list (e.g. before the composition has loaded)
			allowInvalidValues: true,
		});
	}

	// Manual inputs are only shown while the dropdown is on Manual; without a dropdown they are always visible.
	const isManual = showDropdown ? {isVisibleExpression: `$(options:effectChoice) == "${MANUAL_EFFECT_CHOICE}"`} : {};

	if (showDropdown) {
		fields.push({
			id: '_hint_manual',
			type: 'static-text',
			label: '',
			value: 'Manual mode: enter the location and effect index below. Use Companion variables ($(module:var)) in any field.',
			...isManual,
		});
	}

	if (scope === 'layer') {
		fields.push({
			id: 'layer',
			type: 'textinput',
			label: 'Layer (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			...isManual,
		});
	}

	if (scope === 'clip') {
		if (!showDropdown) {
			fields.push({
				id: '_hint_clip',
				type: 'static-text',
				label: '',
				value: 'Enter the layer (row) and column of the clip, then the effect index within that clip.',
			});
		}
		fields.push({
			id: 'layer',
			type: 'textinput',
			label: 'Layer (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			...isManual,
		});
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			...isManual,
		});
	}

	if (scope === 'layergroup') {
		fields.push({
			id: 'layerGroup',
			type: 'textinput',
			label: 'Layer Group (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			...isManual,
		});
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based, left to right in the effect chain)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		...isManual,
	});

	return fields;
}

/**
 * Builds the two-level parameter picker:
 *   1. Collection dropdown (params / mixer / effect) — always visible
 *   2. Per-collection parameter dropdown — visible for the matching collection
 *   3. Manual text input — visible when the active param dropdown is set to Manual
 *
 * The collection and parameter dropdowns drive isVisibleExpression of the other fields,
 * so they set disableAutoExpression (expression-capable fields cannot be referenced).
 */
export function buildParamNameOptions(eu: EffectUtils): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'collection',
			type: 'dropdown',
			label: 'Collection',
			choices: [
				{id: 'params', label: 'params — effect controls (most common)'},
				{id: 'mixer', label: 'mixer — mix/blend parameters'},
				{id: 'effect', label: 'effect — effect-level flags'},
			],
			default: 'params',
			disableAutoExpression: true,
		},
		...COLLECTIONS.map(
			(collection): SomeCompanionFeedbackInputField => ({
				id: `paramChoice_${collection}`,
				type: 'dropdown',
				label: 'Parameter',
				choices: eu.buildParamChoicesForCollection(collection),
				default: MANUAL_PARAM_CHOICE,
				disableAutoExpression: true,
				allowInvalidValues: true,
				isVisibleExpression: `$(options:collection) == "${collection}"`,
			})
		),
		{
			id: 'paramName',
			type: 'textinput',
			label: 'Parameter name (manual, supports variables)',
			default: '',
			useVariables: true,
			isVisibleExpression: COLLECTIONS.map(
				(collection) => `($(options:collection) == "${collection}" && $(options:paramChoice_${collection}) == "${MANUAL_PARAM_CHOICE}")`
			).join(' || '),
		},
	];
}
