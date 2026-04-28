import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {selectDeck} from './actions/select-deck.js';
import {selectNextDeck} from './actions/select-next-deck.js';
import {selectPreviousDeck} from './actions/select-previous-deck.js';

export function getDeckActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const deckUtils = resolumeArenaModuleInstance.getDeckUtils.bind(resolumeArenaModuleInstance);
	return {

		selectDeck: selectDeck(restApi, websocketApi, oscApi, deckUtils),
		selectNextDeck: selectNextDeck(restApi, websocketApi, oscApi, deckUtils),
		selectPreviousDeck: selectPreviousDeck(restApi, websocketApi, oscApi, deckUtils)
	};
}
