import {SomeCompanionFeedbackInputField, Regex, CompanionOptionValues} from '@companion-module/base';
import {EffectUtils, MANUAL_EFFECT_CHOICE} from '../../domain/effects/effect-utils';

/**
 * Builds the effect-choice dropdown (dynamic, from compositionState) plus the manual
 * fallback textinput + scope/location inputs visible only when manual is chosen.
 * Returns SomeCompanionFeedbackInputField[] — compatible with both actions and feedbacks.
 */
export function buildEffectChoiceOptions(eu: EffectUtils): SomeCompanionFeedbackInputField[] {
	const choices = eu.buildEffectChoices();
	return [
		{
			id: 'effectChoice',
			type: 'dropdown',
			label: 'Effect',
			choices,
			default: MANUAL_EFFECT_CHOICE,
		},
	];
}

/**
 * Scope + location inputs shown only when effectChoice === MANUAL_EFFECT_CHOICE.
 */
export function buildEffectScopeOptions(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'scope',
			type: 'dropdown',
			label: 'Scope',
			choices: [
				{id: 'layer', label: 'Layer'},
				{id: 'clip', label: 'Clip'},
				{id: 'layergroup', label: 'Layer Group'},
				{id: 'composition', label: 'Composition'},
			],
			default: 'layer',
			isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
		},
		{
			id: 'layer',
			type: 'textinput',
			label: 'Layer',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) =>
				opts['effectChoice'] === MANUAL_EFFECT_CHOICE &&
				(opts['scope'] === 'layer' || opts['scope'] === 'clip'),
		},
		{
			id: 'column',
			type: 'textinput',
			label: 'Column',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) =>
				opts['effectChoice'] === MANUAL_EFFECT_CHOICE && opts['scope'] === 'clip',
		},
		{
			id: 'layerGroup',
			type: 'textinput',
			label: 'Layer Group',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) =>
				opts['effectChoice'] === MANUAL_EFFECT_CHOICE && opts['scope'] === 'layergroup',
		},
		{
			id: 'effectIdx',
			type: 'textinput',
			label: 'Effect index (1-based)',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE,
		},
	];
}
