import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption, getLayerOption} from '../defaults';
import {WebsocketInstance} from '../websocket';

export function selectClip(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			let websocket = websocketApi();
			if (rest) {
				websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/select`, false)
				websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/select`, true)
			} else {
				oscApi()?.selectClip(options.layer, options.column);
			}
		},
	};
}
