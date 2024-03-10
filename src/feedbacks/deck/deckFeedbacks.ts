import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {deckSelected} from './feedbacks/deckSelected';
import {deckName} from './feedbacks/deckName';
import {selectedDeckName} from './feedbacks/selectedDeckName';
import {nextDeckName} from './feedbacks/nextDeckName';
import {previousDeckName} from './feedbacks/previousDeckName';

export function getDeckApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		deckSelected: deckSelected(resolumeArenaInstance),
		deckName: deckName(resolumeArenaInstance),
		selectedDeckName: selectedDeckName(resolumeArenaInstance),
		nextDeckName: nextDeckName(resolumeArenaInstance),
		previousDeckName: previousDeckName(resolumeArenaInstance)
	};
}
