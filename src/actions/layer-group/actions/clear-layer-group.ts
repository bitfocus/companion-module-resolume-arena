import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerGroupOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {compositionState} from '../../../state';
import {ResolumeArenaModuleInstance} from '../../../index';

export function clearLayerGroup(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clear Layer Group',
		options: [...getLayerGroupOption()],
		callback: async ({options}: {options: any}) => {
			let rest = restApi();
			if (rest) {
				const layergroups = compositionState.get()?.layergroups;
				if (layergroups) {
					const layerGroup = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
					const layersObject = layergroups[layerGroup-1].layers;
					if (layersObject) {
						for (const [_layerIndex, layerObject] of layersObject.entries()) {
							const compositionLayersObject = compositionState.get()?.layers;
							if (compositionLayersObject) {
								for (const [compositionLayerIndex, compositionLayerObject] of compositionLayersObject.entries()) {
									const compositionLayer = compositionLayerIndex+1;
									if (compositionLayerObject.id === layerObject.id) {
										websocketApi()?.triggerPath('/composition/layers/' + compositionLayer + '/clear');
									}
								}
							}
						}
					}
				}
			} else {
				const layerGroup = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
				oscApi()?.clearLayerGroup(layerGroup);
			}
		},
	};
}
