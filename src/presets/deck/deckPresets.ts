import {CompanionPresetDefinitions} from '@companion-module/base';
import {selectDeckPreset} from './presets/selectDeckPreset';
import {selectNextDeckPreset} from './presets/selectNextDeckPreset';
import {selectPreviousDeckPreset} from './presets/selectPreviousDeckPreset';
import {selectedDeckNamePreset} from './presets/selectedDeckNamePreset';

export function getDeckApiPresets(): CompanionPresetDefinitions {
	return {
		selectDeck: selectDeckPreset(),
		selectNextDeck: selectNextDeckPreset(),
		selectPreviousDeck: selectPreviousDeckPreset(),
		selectedDeckName: selectedDeckNamePreset()
	};
}
