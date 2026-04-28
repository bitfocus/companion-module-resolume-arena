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
			const theApi = restApi();
			if (!theApi) return;
			const tapTempoId = compositionState.get()?.tempocontroller?.tempotap?.id!
			websocketApi()?.triggerParam(tapTempoId+'', true)
			websocketApi()?.triggerParam(tapTempoId+'', false)
		},
	};
}
