import {CompanionActionDefinition, Regex} from '@companion-module/base';
import {getLayerOption} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';

function coerceValue(raw: string): string | number | boolean {
	const lower = raw.trim().toLowerCase();
	if (lower === 'true') return true;
	if (lower === 'false') return false;
	const n = Number(raw);
	if (!isNaN(n) && raw.trim() !== '') return n;
	return raw;
}

export function effectParameterSet(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinition {
	return {
		name: 'Set Effect Parameter',
		options: [
			...getLayerOption(),
			{
				id: 'effectIdx',
				type: 'textinput',
				label: 'Effect (1-based index)',
				default: '1',
				useVariables: true,
				regex: Regex.NUMBER,
			},
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
			const layer = +await resolumeArenaInstance.parseVariablesInString(options.layer as string);
			const effectIdx = +await resolumeArenaInstance.parseVariablesInString(options.effectIdx as string);
			const paramName = await resolumeArenaInstance.parseVariablesInString(options.paramName as string);
			const rawValue = await resolumeArenaInstance.parseVariablesInString(options.value as string);
			if (!layer || !effectIdx || !paramName) {
				resolumeArenaInstance.log('warn', 'effectParameterSet: invalid layer, effectIdx or paramName');
				return;
			}
			const eu = resolumeArenaInstance.getEffectUtils();
			const path = eu.effectParamPath(layer, effectIdx, options.collection as any, paramName);
			ws.setPath(path, coerceValue(rawValue));
		},
	};
}
