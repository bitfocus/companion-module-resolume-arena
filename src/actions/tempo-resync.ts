import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {WebsocketInstance} from '../websocket';
import {compositionState} from '../state';

export function tempoResync(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Resync Tempo',
		options: [],
		callback: async ({}: {options: any}) => {
			let theApi = restApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				console.log(compositionState.get()?.tempocontroller)
				let tapTempoId = compositionState.get()!.tempocontroller?.resync?.id!
				thewebsocketApi?.triggerParam(tapTempoId+'', true)
				thewebsocketApi?.triggerParam(tapTempoId+'', false)
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
