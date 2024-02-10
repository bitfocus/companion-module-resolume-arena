import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';

export function layerNextCol(
	_restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Layer Next Column',
		options: [
			{
				type: 'number',
				label: 'Layer Number',
				id: 'layerN',
				min: 1,
				max: 65536,
				default: 1,
				required: true,
			},
			{
				type: 'number',
				label: 'Last (max) Column',
				id: 'colMaxLayerN',
				min: 1,
				max: 65536,
				default: 4,
				required: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			oscApi()?.layerNextCol(options.layerN, options.colMaxLayerN);
		},
	};
}
