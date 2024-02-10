import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerOption} from '../defaults';

export function selectLayer(
	restApi: () => ArenaRestApi | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Layer',
		options: [...getLayerOption()],
		callback: async ({options}: {options: any}) => await restApi()?.Layers.select(options.layer),
	};
}
