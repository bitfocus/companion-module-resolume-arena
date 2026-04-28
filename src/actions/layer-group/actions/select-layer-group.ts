import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

export function selectLayerGroup(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	_oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Select Layer Group',
		options: [...getLayerGroupOption()],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				const layerGroup = +(options.layer);
				thewebsocketApi?.triggerPath('/composition/layergroups/' + layerGroup + '/select');
			}
		},
	};
}
