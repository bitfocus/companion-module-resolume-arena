import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerGroupOption} from '../defaults';

export function selectLayerGroup(
	restApi: () => ArenaRestApi | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Layer Group',
		options: [...getLayerGroupOption()],
		callback: async ({options}: {options: any}) => await restApi()?.LayerGroups.select(options.layerGroup),
	};
}
