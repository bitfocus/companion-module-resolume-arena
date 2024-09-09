import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';

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
			let rest = restApi();
			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			if (rest) {
				websocketApi()?.triggerPath('/composition/layers/' + layer + '/clear');
			} else {
				oscApi()?.clearLayer(layer);
			}
		},
	};
}
