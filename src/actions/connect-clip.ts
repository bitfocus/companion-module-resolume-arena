import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption, getLayerOption} from '../defaults';
import {WebsocketInstance} from '../websocket';

export function connectClip(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			let websocket = websocketApi();
			if (rest) {
				websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/connect`, false)
				websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/connect`, true)
			} else {
				oscApi()?.connectClip(options.layer, options.column);
			}
		},
	};
}
