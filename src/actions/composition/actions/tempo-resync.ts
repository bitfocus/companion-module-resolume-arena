import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {WebsocketInstance} from '../../../websocket.js';
import {compositionState} from '../../../state.js';

export function tempoResync(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Resync Tempo',
		options: [],
		callback: async ({}: {options: any}) => {
			const theApi = restApi();
			if (theApi) {
				const tapTempoId = compositionState.get()!.tempoController?.resync?.id!
				websocketApi()?.triggerParam(tapTempoId+'', true)
				websocketApi()?.triggerParam(tapTempoId+'', false)
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
