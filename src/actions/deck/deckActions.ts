import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {selectDeck} from './actions/select-deck';

export function getDeckActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const deckUtils = resolumeArenaModuleInstance.getDeckUtils.bind(resolumeArenaModuleInstance);
	return {

		selectDeck: selectDeck(restApi, websocketApi, oscApi, deckUtils)
	};
}
