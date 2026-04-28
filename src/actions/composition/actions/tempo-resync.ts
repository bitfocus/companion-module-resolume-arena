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
				// Tolerate camelCase or lowercase tempocontroller key — see tempoTap.
				const tc: any = compositionState.get()?.tempocontroller
					?? (compositionState.get() as any)?.tempoController;
				const resyncId = tc?.resync?.id;
				if (resyncId !== undefined) {
					websocketApi()?.triggerParam(resyncId + '', true);
					websocketApi()?.triggerParam(resyncId + '', false);
				} else {
					console.warn('tempoResync: could not resolve param id. tempocontroller =', tc);
					oscApi()?.tempoTap();
				}
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
