import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function previousDeckName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Previous Deck Name',
		options: [{
			id: 'previous',
			type: 'number',
			label: 'Previous',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getDeckUtils()!.deckPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getDeckUtils()!)
	};
}