import {CompanionActionDefinition, Regex} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

export function layerGroupPrevCol(
	_restApi: () => (ArenaRestApi | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Group Previous Column',
		options: [
			{
				type: 'textinput',
				regex: Regex.NUMBER,
				label: 'Layer Group Number',
				id: 'layerGroup',
				default: '1',
				minLength: 1,
				useVariables: true
			},
			{
				type: 'textinput',
				regex: Regex.NUMBER,
				label: 'Last Column',
				id: 'lastColumn',
				default: '4',
				minLength: 1,
				useVariables: true
			},
		],
		callback: async ({options}: {options: any}) => {
			const layerGroup = +(options.layer);
			const lastColumn = +(options.lastColumn);
			oscApi()?.groupPrevCol(layerGroup, lastColumn);
		},
	};
}
