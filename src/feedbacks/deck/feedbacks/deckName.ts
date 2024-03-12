import {ResolumeArenaModuleInstance} from '../../../index';
import {getDeckOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function deckName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Deck Name',
		options: [...getDeckOption()],
		callback: resolumeArenaInstance.getDeckUtils()!.deckNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}