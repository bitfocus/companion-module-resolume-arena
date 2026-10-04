import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {WebsocketInstance} from '../../../websocket.js';
import {DeckUtils} from '../../../domain/deck/deck-util.js';

export function selectPreviousDeck(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => (ArenaOscApi | null),
	deckUtils: () => DeckUtils | null
): CompanionActionDefinition {
	return {
		name: 'Select Previous Deck',
		options: [],
		callback: async () => {
			let theApi = restApi();
			let theDeckUtils = deckUtils();
			if (theApi && theDeckUtils) {
				let deck = theDeckUtils.calculatePreviousDeck(1);
				if (deck != undefined) {
					websocketApi()?.triggerPath('/composition/decks/' + deck + '/select');
				}
			} else {
				oscApi()?.compPrevDeck();
			}
		}
	};
}
