import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerOption} from '../defaults';

export function clearLayer(
	restApi: () => ArenaRestApi | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Clear Layer',
		options: [...getLayerOption()],
		callback: async ({options}: {options: any}) => {
			let rest = restApi();
			if (rest) {
				await rest.Layers.clear(options.layer);
			} else {
				oscApi()?.clearLayer(options.layer);
			}
		},
	};
}
