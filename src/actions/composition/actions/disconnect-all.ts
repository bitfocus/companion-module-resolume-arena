import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {WebsocketInstance} from '../../../websocket.js';

export function disconnectAll(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Disconnect All Clips',
		options: [],
		callback: async () => {
			const rest = restApi();
			if (rest) {
				websocketApi()?.triggerPath('/composition/disconnect-all');
			} else {
				oscApi()?.clearAllLayers();
			}
		},
	};
}
