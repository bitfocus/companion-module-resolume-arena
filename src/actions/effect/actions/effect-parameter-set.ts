import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions} from '../effect-action-options';

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

export function effectParameterSet(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope): CompanionActionDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		name: `Set Effect Parameter (${SCOPE_LABELS[scope]})`,
		options: [
			...buildScopedEffectOptions(eu, scope),
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
			{
				id: 'paramName',
				type: 'textinput',
				label: 'Parameter name',
				default: '',
				useVariables: true,
			},
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
			const paramName = await resolumeArenaInstance.parseVariablesInString(options.paramName as string);
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
