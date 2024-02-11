import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';

export function layerGroupPrevCol(
	_restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Layer Group Previous Column',
		options: [
			{
				type: 'number',
				label: 'Layer Group Number',
				id: 'layerGroup',
				min: 1,
				max: 65535,
				default: 1,
				required: true,
			},
			{
				type: 'number',
				label: 'Last Column',
				id: 'lastColumn',
				min: 1,
				max: 65535,
				default: 4,
				required: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			oscApi()?.groupPrevCol(options.layerGroup, options.lastColumn);
		},
	};
}
