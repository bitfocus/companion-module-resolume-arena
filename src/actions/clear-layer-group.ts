import { CompanionActionDefinition } from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import { getLayerGroupOption } from '../defaults';

export function clearLayerGroup(
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Clear Layer Group',
		options: [...getLayerGroupOption()],
		callback: async ({options}: {options: any}) => {
			oscApi()?.clearLayerGroup(options.layerGroup);
		},
	};
}
