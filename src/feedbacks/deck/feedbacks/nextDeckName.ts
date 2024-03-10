import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextDeckName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Next Deck Name',
		options: [{
			id: 'next',
			type: 'number',
			label: 'Next',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getDeckUtils()!.deckNextNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}