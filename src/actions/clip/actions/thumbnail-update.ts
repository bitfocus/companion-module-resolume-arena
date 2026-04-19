import {CompanionActionDefinition} from '@companion-module/base';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';

export function thumbnailUpdate(
	websocketApi: () => (WebsocketInstance | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Refresh Clip Thumbnail',
		description: 'Request Resolume to push the current thumbnail for a clip via WebSocket',
		options: [...getClipOption()],
		callback: async ({options}: {options: any}): Promise<void> => {
			const websocket = websocketApi();
			if (!websocket) {
				resolumeArenaModuleInstance.log('warn', 'Refresh Clip Thumbnail requires a WebSocket connection (REST mode)');
				return;
			}
			const layer = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
			const column = +await resolumeArenaModuleInstance.parseVariablesInString(options.column);
			websocket.subscribePath(`/composition/layers/${layer}/clips/${column}/thumbnail`);
		},
	};
}
