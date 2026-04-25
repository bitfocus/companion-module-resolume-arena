import {SomeCompanionFeedbackInputField, Regex} from '@companion-module/base';
import {EffectUtils, EffectScope, MANUAL_EFFECT_CHOICE} from '../../domain/effects/effect-utils.js';

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
			// referenced by isVisibleExpression on other fields — must opt out of auto-expression
			disableAutoExpression: true,
		} as any);
	}

	const manualExpr = showDropdown ? '$(options:effectChoice) == "__manual__"' : 'true';

	if (showDropdown) {
		fields.push({
			id: '_hint_manual',
			type: 'static-text',
			label: '',
			value: 'Manual mode: enter the location and effect index below. Use Companion variables in any field.',
			isVisibleExpression: manualExpr,
		} as any);
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
		} as any);
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
		} as any);
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisibleExpression: manualExpr,
		} as any);
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
		} as any);
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based, left to right in the effect chain)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		isVisibleExpression: manualExpr,
	} as any);

	return fields;
}

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
		} as any,
		{
			id: 'paramChoice_params',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('params'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "params"',
			disableAutoExpression: true,
		} as any,
		{
			id: 'paramChoice_mixer',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('mixer'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "mixer"',
			disableAutoExpression: true,
		} as any,
		{
			id: 'paramChoice_effect',
			type: 'dropdown',
			label: 'Parameter',
			choices: eu.buildParamChoicesForCollection('effect'),
			default: '__manual_param__',
			isVisibleExpression: '$(options:collection) == "effect"',
			disableAutoExpression: true,
		} as any,
		{
			id: 'paramName',
			type: 'textinput',
			label: 'Parameter name (manual, supports variables)',
			default: '',
			useVariables: true,
			isVisibleExpression: '($(options:collection) == "params" && $(options:paramChoice_params) == "__manual_param__") || ($(options:collection) == "mixer" && $(options:paramChoice_mixer) == "__manual_param__") || ($(options:collection) == "effect" && $(options:paramChoice_effect) == "__manual_param__")',
		} as any,
	];
}
