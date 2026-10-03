import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDeckOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function deckName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Deck Name',
		options: [...getDeckOption()],
		callback: resolumeArenaInstance.getDeckUtils()!.deckNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}