import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';

export function selectClip(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	oscApi: () => (ArenaOscApi | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Select Clip',
		options: [...getClipOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			let websocket = websocketApi();

			resolumeArenaModuleInstance.log('error','clicked select' + JSON.stringify(options))

			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			const column = +await resolumeArenaModuleInstance.parseVariablesInString(options.column);
			resolumeArenaModuleInstance.log('error','clicked select layer' + layer + ' col ' + column)

			if (rest) {
				await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/select`, true);
				await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/select`, false);
			} else {
				oscApi()?.selectClip(layer, column);
			}
		}
	};
}
