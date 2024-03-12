import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';

export function clearLayer(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Clear Layer',
		options: [...getLayerOption()],
		callback: async ({options}: {options: any}) => {
			let rest = restApi();
			if (rest) {
				websocketApi()?.triggerPath('/composition/layers/' + options.layer + '/clear');
			} else {
				oscApi()?.clearLayer(options.layer);
			}
		},
	};
}
