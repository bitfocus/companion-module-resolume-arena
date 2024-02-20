import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getDeckOption} from '../defaults';
import {WebsocketInstance} from '../websocket';

export function selectDeck(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Select Deck',
		options: [...getDeckOption()],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			if (theApi) {
				const deck = options.deck;
				if (deck != undefined) {
					websocketApi()?.triggerPath('/composition/decks/' + deck + '/select');
				}
			}
		},
	};
}
