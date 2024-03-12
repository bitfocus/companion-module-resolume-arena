import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {WebsocketInstance} from '../../../websocket';
import {compositionState} from '../../../state';

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
				let tapTempoId = compositionState.get()!.tempocontroller?.tempo_tap?.id!
				thewebsocketApi?.triggerParam(tapTempoId+'', true)
				thewebsocketApi?.triggerParam(tapTempoId+'', false)
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
