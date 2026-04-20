import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope, EffectParamMode, MANUAL_PARAM_CHOICE, MANUAL_VALUE_CHOICE} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions, buildParamNameOptions} from '../effect-action-options';
import {parameterStates} from '../../../state';

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
			{
				id: '_hint_collection',
				type: 'static-text',
				label: '',
				value: 'Collection: "params" covers most effect controls. Use "mixer" for mix/blend parameters, "effect" for effect-level flags.',
			},
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
			},
			...buildParamNameOptions(eu),
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
				id: 'valueChoice',
				type: 'dropdown',
				label: 'Value — select a known option or choose Manual to type',
				choices: eu.buildValueChoices(),
				default: MANUAL_VALUE_CHOICE,
				isVisible: (opts) => opts['mode'] === 'set',
			},
			{
				id: 'value',
				type: 'textinput',
				label: 'Value (number, true/false, or text — supports variables)',
				default: '',
				useVariables: true,
				isVisible: (opts) => {
					const mode = opts['mode'] as string;
					if (mode === 'toggle') return false;
					if (mode === 'set') return opts['valueChoice'] === MANUAL_VALUE_CHOICE;
					return true; // increase / decrease always show the delta field
				},
			},
		],
		callback: async ({options}) => {
			const ws = resolumeArenaInstance.getWebsocketApi();
			if (!ws) return;
			const resolved = await eu.parseScopeOptionsFromAction({...options, scope}, resolumeArenaInstance);
			const rawParamChoice = options.paramChoice as string;
			const paramName = rawParamChoice === MANUAL_PARAM_CHOICE
				? await resolumeArenaInstance.parseVariablesInString(options.paramName as string)
				: rawParamChoice;
			if (!resolved.effectIdx || !paramName) {
				resolumeArenaInstance.log('warn', 'effectParameterSet: invalid effectIdx or paramName');
				return;
			}
			const path = eu.effectParamPath(resolved.scope, resolved.location, resolved.effectIdx, options.collection as any, paramName);
			const mode = (options.mode as EffectParamMode | undefined) ?? 'set';

			if (mode === 'toggle') {
				const current = parameterStates.get()[path]?.value;
				ws.setPath(path, !current);
				return;
			}

			const rawValueChoice = options.valueChoice as string | undefined;
			const rawValue = rawValueChoice && rawValueChoice !== MANUAL_VALUE_CHOICE
				? rawValueChoice
				: await resolumeArenaInstance.parseVariablesInString(options.value as string);

			if (mode === 'increase' || mode === 'decrease') {
				const current = parameterStates.get()[path]?.value;
				const base = typeof current === 'number' ? current : 0;
				const delta = parseFloat(rawValue) || 0;
				ws.setPath(path, mode === 'increase' ? base + delta : base - delta);
				return;
			}

			ws.setPath(path, coerceValue(rawValue));
		},
	};
}
