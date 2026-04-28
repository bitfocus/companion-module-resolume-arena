import {SomeCompanionFeedbackInputField, Regex} from '@companion-module/base';
import {EffectUtils, EffectScope, MANUAL_EFFECT_CHOICE} from '../../domain/effects/effect-utils.js';

/**
 * Builds options for an effect action or feedback for the given scope.
 *
 * For composition/layergroup/layer: always shows a dynamic effect dropdown.
 * For clip: shows manual inputs only by default. Pass withClipList=true to
 * include the full clip-effects dropdown (only suitable for small compositions).
 *
 * NOTE: This file uses API 2.0 `isVisibleExpression: '$(options:foo) == "bar"'`
 * instead of the 1.x `isVisible: (opts) => ...` callback form. Fields that are
 * referenced from `isVisibleExpression` of OTHER action/feedback fields must
 * carry `disableAutoExpression: true` so Companion treats them as raw values
 * rather than expressions during evaluation.
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
			disableAutoExpression: true,
		});
	}

	const manualExpr = showDropdown ? `$(options:effectChoice) == "${MANUAL_EFFECT_CHOICE}"` : 'true';

	if (showDropdown) {
		fields.push({
			id: '_hint_manual',
			type: 'static-text',
			label: '',
			value: 'Manual mode: enter the location and effect index below. Use Companion variables ($(module:var)) in any field.',
			isVisibleExpression: manualExpr,
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
			isVisibleExpression: manualExpr,
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
			isVisibleExpression: manualExpr,
		});
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisibleExpression: manualExpr,
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
			isVisibleExpression: manualExpr,
		});
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based, left to right in the effect chain)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		isVisibleExpression: manualExpr,
	});

	return fields;
}

/**
 * Builds the two-level parameter picker.
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
		{
			id: 'paramChoice_params',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('params'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "params"',
			disableAutoExpression: true,
		},
		{
			id: 'paramChoice_mixer',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('mixer'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "mixer"',
			disableAutoExpression: true,
		},
		{
			id: 'paramChoice_effect',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('effect'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "effect"',
			disableAutoExpression: true,
		},
		{
			id: 'paramName',
			type: 'textinput',
			label: 'Parameter name (manual, supports variables)',
			default: '',
			useVariables: true,
			isVisibleExpression:
				'($(options:collection) == "params" && $(options:paramChoice_params) == "__manual_param__") || ' +
				'($(options:collection) == "mixer" && $(options:paramChoice_mixer) == "__manual_param__") || ' +
				'($(options:collection) == "effect" && $(options:paramChoice_effect) == "__manual_param__")',
		},
	];
}
