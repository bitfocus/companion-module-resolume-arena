import {CompanionPresetDefinitions} from '@companion-module/base';
import {selectDeckPreset} from './presets/selectDeckPreset.js';
import {selectNextDeckPreset} from './presets/selectNextDeckPreset.js';
import {selectPreviousDeckPreset} from './presets/selectPreviousDeckPreset.js';
import {selectedDeckNamePreset} from './presets/selectedDeckNamePreset.js';

export function getDeckApiPresets(): CompanionPresetDefinitions {
	return {
		selectDeck: selectDeckPreset(),
		selectNextDeck: selectNextDeckPreset(),
		selectPreviousDeck: selectPreviousDeckPreset(),
		selectedDeckName: selectedDeckNamePreset()
	};
}
