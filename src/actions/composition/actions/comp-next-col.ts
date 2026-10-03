import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';

export function compNextCol(
	_restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Composition Next Column',
		options: [
		],
		callback: async () => {
			oscApi()?.compNextCol();
		},
	};
}
