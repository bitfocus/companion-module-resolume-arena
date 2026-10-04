import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {deckSelected} from './feedbacks/deckSelected.js';
import {deckName} from './feedbacks/deckName.js';
import {selectedDeckName} from './feedbacks/selectedDeckName.js';
import {nextDeckName} from './feedbacks/nextDeckName.js';
import {previousDeckName} from './feedbacks/previousDeckName.js';

export function getDeckApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		deckSelected: deckSelected(resolumeArenaInstance),
		deckName: deckName(resolumeArenaInstance),
		selectedDeckName: selectedDeckName(resolumeArenaInstance),
		nextDeckName: nextDeckName(resolumeArenaInstance),
		previousDeckName: previousDeckName(resolumeArenaInstance)
	};
}
