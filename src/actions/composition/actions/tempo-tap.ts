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
			if (theApi) {
				// Resolume's WS JSON key naming for this param has drifted
				// across versions. Observed:
				//   - tempoTap   (Swagger camelCase — old)
				//   - tempotap   (lowercase no separator — older docs)
				//   - tempo_tap  (snake_case — Arena 7.25.x)
				// Try all three; log the runtime shape if none resolves.
				const tc: any = compositionState.get()?.tempocontroller
					?? (compositionState.get() as any)?.tempoController;
				const tap = tc?.tempo_tap ?? tc?.tempotap ?? tc?.tempoTap;
				const tapId = tap?.id;
				if (tapId !== undefined) {
					websocketApi()?.triggerParam(tapId + '', true);
					websocketApi()?.triggerParam(tapId + '', false);
				} else {
					console.warn('tempoTap: could not resolve param id. tempocontroller =', tc);
					// Fall back to OSC path-based trigger via REST websocket.
					// triggerParam needs a numeric id; without it, we can't fire
					// via WS. Try OSC as last resort.
					oscApi()?.tempoTap();
				}
			} else {
				oscApi()?.tempoTap();
			}
		},
	};
}
