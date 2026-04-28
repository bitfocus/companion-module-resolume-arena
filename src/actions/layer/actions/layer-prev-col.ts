import {CompanionActionDefinition, Regex} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

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
				minLength: 1,
				useVariables: true
			}
		],

		callback: async ({options}: {options: any}) => {
			const layer = +(options.layer);
			oscApi()?.layerPrevCol(layer);
		},
	};
}
