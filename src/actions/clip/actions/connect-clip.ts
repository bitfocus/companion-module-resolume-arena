import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';

export function connectClip(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Trigger Clip',
		options: [...getClipOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			let websocket = websocketApi();
			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			const column = +await resolumeArenaModuleInstance.parseVariablesInString(options.column);
			if (rest) {
				await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/connect`, true)
				await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/connect`, false)
			} else {
				oscApi()?.connectClip(layer, column);
			}
		},
	};
}
