import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getLayerOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

export function clearLayer(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clear Layer',
		options: [...getLayerOption()],
		callback: async ({options}: {options: any}) => {
			const rest = restApi();
			const layer = +(options.layer);
			if (rest) {
				websocketApi()?.triggerPath('/composition/layers/' + layer + '/clear');
			} else {
				oscApi()?.clearLayer(layer);
			}
		},
	};
}
