import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {WebsocketInstance} from '../../../websocket';
import {DeckUtils} from '../../../domain/deck/deck-util';

export function selectNextDeck(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => (ArenaOscApi | null),
	deckUtils: () => DeckUtils | null
): CompanionActionDefinition {
	return {
		name: 'Select Next Deck',
		options: [],
		callback: async () => {
			let theApi = restApi();
			let theDeckUtils = deckUtils();
			if (theApi && theDeckUtils) {
				let deck = theDeckUtils.calculateNextDeck(1);
				if (deck != undefined) {
					websocketApi()?.triggerPath('/composition/decks/' + deck + '/select');
				}
			} else {
				oscApi()?.compNextDeck();
			}
		}
	};
}
