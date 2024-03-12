import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function selectedDeckName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Selected Deck Name',
		options: [],
		callback: resolumeArenaInstance.getDeckUtils()!.deckSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}