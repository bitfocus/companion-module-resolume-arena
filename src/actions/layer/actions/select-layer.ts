import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';

export function selectLayer(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Layer',
		options: [...getLayerOption()],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				thewebsocketApi?.triggerPath('/composition/layers/' + options.layer + '/select');
			}
		},
	};
}
