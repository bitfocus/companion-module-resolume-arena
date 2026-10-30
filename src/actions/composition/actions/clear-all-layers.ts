import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {compositionState} from '../../../state.js';
import {WebsocketInstance} from '../../../websocket.js';

export function clearAllLayers(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Clear All Layers',
		options: [],
		callback: async ({}: {options: any}) => {
			let theApi = restApi();
			let theOscApi = oscApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				const layers = compositionState.get()?.layers;
				if (layers) {
					for (const [layerIndex, _layerObject] of layers.entries()) {
						const layer = layerIndex + 1;
						thewebsocketApi?.triggerPath(`/composition/layers/${layer}/clear`);
					}
				}
			} else {
				theOscApi?.clearAllLayers();
			}
		},
	};
}
