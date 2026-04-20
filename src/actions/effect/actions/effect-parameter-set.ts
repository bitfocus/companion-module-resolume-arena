import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions, buildParamNameOptions} from '../effect-action-options';
import {MANUAL_PARAM_CHOICE} from '../../../domain/effects/effect-utils';

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
				id: 'collection',
				type: 'dropdown',
				label: 'Collection',
				choices: [
					{id: 'params', label: 'params'},
					{id: 'mixer', label: 'mixer'},
					{id: 'effect', label: 'effect'},
				],
				default: 'params',
			},
			...buildParamNameOptions(eu, scope),
			{
				id: 'value',
				type: 'textinput',
				label: 'Value',
				default: '',
				useVariables: true,
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
			const rawValue = await resolumeArenaInstance.parseVariablesInString(options.value as string);
			if (!resolved.effectIdx || !paramName) {
				resolumeArenaInstance.log('warn', 'effectParameterSet: invalid effectIdx or paramName');
				return;
			}
			const path = eu.effectParamPath(resolved.scope, resolved.location, resolved.effectIdx, options.collection as any, paramName);
			ws.setPath(path, coerceValue(rawValue));
		},
	};
}
