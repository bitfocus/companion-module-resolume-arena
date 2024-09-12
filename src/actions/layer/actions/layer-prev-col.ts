import {CompanionActionDefinition, Regex} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {ResolumeArenaModuleInstance} from '../../../index';

export function layerPrevCol(
	_restApi: () => (ArenaRestApi | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Previous Column',
		options: [
			{
				type: 'textinput',
				regex: Regex.NUMBER,
				label: 'Layer Number',
				id: 'layerN',
				default: '1',
				required: true,
				useVariables: true
			}
		],

		callback: async ({options}: {options: any}) => {
			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			oscApi()?.layerPrevCol(layer);
		},
	};
}
