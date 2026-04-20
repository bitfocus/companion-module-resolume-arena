import {SomeCompanionFeedbackInputField, Regex, CompanionOptionValues} from '@companion-module/base';
import {EffectUtils, EffectScope, MANUAL_EFFECT_CHOICE, MANUAL_PARAM_CHOICE} from '../../domain/effects/effect-utils';

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
		});
	}

	const isManual = showDropdown
		? (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE
		: () => true;

	if (showDropdown) {
		fields.push({
			id: '_hint_manual',
			type: 'static-text',
			label: '',
			value: 'Manual mode: enter the location and effect index below. Use Companion variables ($(module:var)) in any field.',
			isVisible: isManual,
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
			isVisible: isManual,
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
			isVisible: isManual,
		});
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: isManual,
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
			isVisible: isManual,
		});
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based, left to right in the effect chain)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		isVisible: isManual,
	});

	return fields;
}

/**
 * Builds a parameter-name dropdown (deduplicated from compositionState) plus
 * a manual textinput shown when the manual sentinel is selected.
 */
export function buildParamNameOptions(eu: EffectUtils, scope: EffectScope): SomeCompanionFeedbackInputField[] {
	const choices = eu.buildParamChoices(scope);
	return [
		{
			id: 'paramChoice',
			type: 'dropdown',
			label: 'Parameter — select a known parameter or choose Manual to type one',
			choices,
			default: MANUAL_PARAM_CHOICE,
		},
		{
			id: 'paramName',
			type: 'textinput',
			label: 'Parameter name (manual, supports variables)',
			default: '',
			useVariables: true,
			isVisible: (opts: CompanionOptionValues) => opts['paramChoice'] === MANUAL_PARAM_CHOICE,
		},
	];
}
