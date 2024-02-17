import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption} from '../defaults';

export function triggerColumn(
	restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Column',
		options: [...getColumnOption()],
		callback: async ({options}: {options: any}) => {
			let rest = restApi();
			if (rest) {
				await rest.Columns.connectColumn(options.column);
			} else {
				oscApi()?.triggerColumn(options.column);
			}
		},
	};
}
