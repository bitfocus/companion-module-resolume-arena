import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {EffectScope, EffectParamMode, EffectCollection, MANUAL_PARAM_CHOICE, MANUAL_VALUE_CHOICE} from '../../../domain/effects/effect-utils.js';
import {buildScopedEffectOptions, buildParamNameOptions} from '../effect-action-options.js';
import {parameterStates} from '../../../state.js';

function coerceValue(raw: string): string | number | boolean {
	const lower = raw.trim().toLowerCase();
	if (lower === 'true') return true;
	if (lower === 'false') return false;
	const n = Number(raw);
	if (!isNaN(n) && raw.trim() !== '') return n;
	return raw;
}

const SCOPE_LABELS: Record<EffectScope, string> = {
	layer: 'Layer',
	clip: 'Clip',
	layergroup: 'Layer Group',
	composition: 'Composition',
};

export function effectParameterSet(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope, withClipList = false): CompanionActionDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	const nameSuffix = withClipList ? ' — from list' : '';
	return {
		name: `Set Effect Parameter (${SCOPE_LABELS[scope]}${nameSuffix})`,
		options: [
			...buildScopedEffectOptions(eu, scope, withClipList),
			...buildParamNameOptions(eu),
			// Mode and value — IMPORTANT: isVisible serialized via .toString(), no imported constants.
			{
				id: 'mode',
				type: 'dropdown',
				label: 'Mode',
				choices: [
					{id: 'set', label: 'Set — write a fixed value'},
					{id: 'increase', label: 'Increase by — add delta to current value'},
					{id: 'decrease', label: 'Decrease by — subtract delta from current value'},
					{id: 'toggle', label: 'Toggle — flip boolean on/off'},
				],
				default: 'set',
			},
			{
				id: 'valueChoice_params',
				type: 'dropdown',
				label: 'Value — known options',
				choices: eu.buildValueChoicesForCollection('params'),
				default: '__manual_value__',
				isVisibleExpression: '$(options:mode) == "set" && $(options:collection) == "params"',
			},
			{
				id: 'valueChoice_mixer',
				type: 'dropdown',
				label: 'Value — known options',
				choices: eu.buildValueChoicesForCollection('mixer'),
				default: '__manual_value__',
				isVisibleExpression: '$(options:mode) == "set" && $(options:collection) == "mixer"',
			},
			{
				id: 'valueChoice_effect',
				type: 'dropdown',
				label: 'Value — known options',
				choices: eu.buildValueChoicesForCollection('effect'),
				default: '__manual_value__',
				isVisibleExpression: '$(options:mode) == "set" && $(options:collection) == "effect"',
			},
			{
				id: 'value',
				type: 'textinput',
				label: 'Value (number, true/false, or text — supports variables)',
				default: '',
				useVariables: true,
				isVisibleExpression: '$(options:mode) != "toggle" && ($(options:mode) != "set" || $(options:valueChoice_params) == "__manual_value__" && $(options:valueChoice_mixer) == "__manual_value__" && $(options:valueChoice_effect) == "__manual_value__")',
			},
		],
		callback: async ({options}) => {
			const ws = resolumeArenaInstance.getWebsocketApi();
			if (!ws) return;
			const resolved = eu.parseScopeOptionsFromAction({...options, scope}, resolumeArenaInstance);

			const collection = options.collection as EffectCollection;
			const rawParamChoice = options[`paramChoice_${collection}`] as string | undefined;
			const paramName = (!rawParamChoice || rawParamChoice === MANUAL_PARAM_CHOICE)
				? (options.paramName as string)
				: rawParamChoice;

			if (!resolved.effectIdx || !paramName) {
				resolumeArenaInstance.log('warn', 'effectParameterSet: invalid effectIdx or paramName');
				return;
			}

			const param = eu.getEffectParam(resolved.scope, resolved.location, resolved.effectIdx, collection, paramName);
			if (param?.id === undefined) {
				resolumeArenaInstance.log('warn', `effectParameterSet: param '${paramName}' not found in composition state`);
				return;
			}
			const paramId = param.id;
			const mode = (options.mode as EffectParamMode | undefined) ?? 'set';

			const paramKey = '/parameter/by-id/' + paramId;

			if (mode === 'toggle') {
				const current = parameterStates.get()[paramKey]?.value ?? param.value;
				const next = !current;
				ws.setParam(String(paramId), next);
				parameterStates.set({...parameterStates.get(), [paramKey]: {path: paramKey, value: next} as any});
				return;
			}

			if (mode === 'increase' || mode === 'decrease') {
				// Always read delta from the value textinput — value choice dropdowns are for 'set' only
				const delta = parseFloat(options.value as string) || 0;
				const current = parameterStates.get()[paramKey]?.value ?? param.value;
				const base = typeof current === 'number' ? current : 0;
				const next = mode === 'increase' ? base + delta : base - delta;
				ws.setParam(String(paramId), next);
				// Write back so the next press uses the updated value, not the stale compositionState snapshot
				parameterStates.set({...parameterStates.get(), [paramKey]: {path: paramKey, value: next} as any});
				return;
			}

			const rawValueChoice = options[`valueChoice_${collection}`] as string | undefined;
			const rawValue = rawValueChoice && rawValueChoice !== MANUAL_VALUE_CHOICE
				? rawValueChoice
				: (options.value as string);
			ws.setParam(String(paramId), coerceValue(rawValue));
		},
	};
}
