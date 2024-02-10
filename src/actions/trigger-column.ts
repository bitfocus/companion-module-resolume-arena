import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';

export function triggerColumn(
	_restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Start Column',
		options: [
			{
				type: 'number',
				label: 'Column',
				id: 'column',
				min: 1,
				max: 100,
				default: 1,
				required: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			oscApi()?.triggerColumn(options.column);
		},
	};
}
