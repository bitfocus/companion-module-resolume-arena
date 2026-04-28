import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getClipOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

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
			const rest = restApi();
			if (!rest) return;
			const websocket = websocketApi();
			const layer = +(options.layer);
			const column = +(options.column);
			await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/connect`, true)
			await websocket?.triggerPath(`/composition/layers/${layer}/clips/${column}/connect`, false)
		},
	};
}
