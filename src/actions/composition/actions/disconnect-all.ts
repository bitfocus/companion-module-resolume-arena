import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {WebsocketInstance} from '../../../websocket';

export function disconnectAll(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Disconnect All Clips',
		options: [],
		callback: async () => {
			if (restApi()) {
				websocketApi()?.triggerPath('/composition/disconnect-all');
			} else {
				oscApi()?.clearAllLayers();
			}
		},
	};
}
