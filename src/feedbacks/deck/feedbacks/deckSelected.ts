import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getDeckOption, getDefaultStyleGreen} from '../../../defaults.js';

export function deckSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Deck Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getDeckOption()],
		callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}