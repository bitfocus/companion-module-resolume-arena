import {SomeCompanionFeedbackInputField, Regex, CompanionOptionValues} from '@companion-module/base';
import {EffectUtils, EffectScope, MANUAL_EFFECT_CHOICE} from '../../domain/effects/effect-utils';

// Clip scope is excluded from the effect dropdown — a composition can have hundreds
// of clips and populating all their effects would make the dropdown unusably large.
// Clip scope always uses manual entry.
const SCOPE_SUPPORTS_DROPDOWN: Record<EffectScope, boolean> = {
	composition: true,
	layergroup: true,
	layer: true,
	clip: false,
};

/**
 * Builds options for an effect action or feedback for the given scope.
 *
 * For composition/layergroup/layer: shows a dynamic dropdown of known effects
 * (from compositionState) plus a manual fallback that reveals location + index inputs.
 *
 * For clip: always shows manual inputs (layer, column, effectIdx) because a large
 * composition can have hundreds of clips and enumerating all their effects would
 * make the action definition payload too large for the Companion web UI.
 */
export function buildScopedEffectOptions(eu: EffectUtils, scope: EffectScope): SomeCompanionFeedbackInputField[] {
	const fields: SomeCompanionFeedbackInputField[] = [];

	if (SCOPE_SUPPORTS_DROPDOWN[scope]) {
		const allChoices = eu.buildEffectChoices();
		const prefix = `${scope}:`;
		const filtered = allChoices.filter((c) => c.id === MANUAL_EFFECT_CHOICE || String(c.id).startsWith(prefix));
		fields.push({
			id: 'effectChoice',
			type: 'dropdown',
			label: 'Effect',
			choices: filtered,
			default: MANUAL_EFFECT_CHOICE,
		});
	}

	const isManual = SCOPE_SUPPORTS_DROPDOWN[scope]
		? (opts: CompanionOptionValues) => opts['effectChoice'] === MANUAL_EFFECT_CHOICE
		: () => true;

	if (scope === 'layer') {
		fields.push({
			id: 'layer',
			type: 'textinput',
			label: 'Layer',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
			isVisible: isManual,
		});
	}

	if (scope === 'clip') {
		fields.push({
			id: 'layer',
			type: 'textinput',
			label: 'Layer',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
		});
		fields.push({
			id: 'column',
			type: 'textinput',
			label: 'Column',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
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
			isVisible: isManual,
		});
	}

	fields.push({
		id: 'effectIdx',
		type: 'textinput',
		label: 'Effect index (1-based)',
		default: '1',
		useVariables: true,
		regex: Regex.NUMBER,
		isVisible: isManual,
	});

	return fields;
}
