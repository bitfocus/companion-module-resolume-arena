import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {WebsocketInstance} from '../../../websocket.js';
import {compositionState} from '../../../state.js';

export function tempoTap(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Tap Tempo',
		options: [],
		callback: async ({}: {options: any}) => {
			let theApi = restApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				let tapTempoId = compositionState.get()!.tempoController?.tempoTap?.id!
				thewebsocketApi?.triggerParam(tapTempoId+'', true)
				thewebsocketApi?.triggerParam(tapTempoId+'', false)
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
