import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';

export function selectClip(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Clip',
		options: [...getClipOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			let rest = restApi();
			let websocket = websocketApi();
			if (rest) {
				await websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/select`, true)
				await websocket?.triggerPath(`/composition/layers/${options.layer}/clips/${ options.column}/select`, false)
			} else {
				oscApi()?.selectClip(options.layer, options.column);
			}
		},
	};
}
