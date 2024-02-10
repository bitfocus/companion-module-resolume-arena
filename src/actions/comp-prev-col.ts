import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';

export function compPrevCol(
	_restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Composition Previous Column',
		options: [
			{
				type: 'number',
				label: 'Last (max) Column',
				id: 'colMaxCompPrev',
				min: 1,
				max: 65536,
				default: 4,
				required: true,
			},
		],

		callback: async ({options}: {options: any}) => {
			oscApi()?.compPrevCol(options.colMaxCompPrev);
		},
	};
}
