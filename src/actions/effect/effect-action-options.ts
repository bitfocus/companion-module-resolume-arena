import {SomeCompanionFeedbackInputField, Regex, CompanionOptionValues} from '@companion-module/base';
import {EffectUtils, EffectScope, MANUAL_EFFECT_CHOICE} from '../../domain/effects/effect-utils';

/**
 * Builds the effect-choice dropdown filtered to the given scope,
 * plus the manual fallback inputs shown only when the manual option is selected.
 */
export function buildScopedEffectOptions(eu: EffectUtils, scope: EffectScope): SomeCompanionFeedbackInputField[] {
	const allChoices = eu.buildEffectChoices();
	const prefix = scope === 'composition' ? 'composition:' : `${scope}:`;
	const filtered = allChoices.filter((c) => c.id === MANUAL_EFFECT_CHOICE || String(c.id).startsWith(prefix));

	const fields: SomeCompanionFeedbackInputField[] = [
		{
			id: 'effectChoice',
			type: 'dropdown',
			label: 'Effect',
			choices: filtered,
			default: MANUAL_EFFECT_CHOICE,
		},
	];

	// Location inputs — only shown when manual is selected
	if (scope === 'layer' || scope === 'clip') {
		fields.push({
			id: 'layer',
			type: 'textinput',
			label: 'Layer',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
		});
	}
	if (scope === 'clip') {
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
		});
	}
	if (scope === 'layergroup') {
		fields.push({
			id: 'layerGroup',
			type: 'textinput',
			label: 'Layer Group',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
		});
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
	});

	return fields;
}
