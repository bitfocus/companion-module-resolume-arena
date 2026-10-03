import type {CategorizedPresets} from '../preset-structure.js';
import {selectDeckPreset} from './presets/selectDeckPreset.js';
import {selectNextDeckPreset} from './presets/selectNextDeckPreset.js';
import {selectPreviousDeckPreset} from './presets/selectPreviousDeckPreset.js';
import {selectedDeckNamePreset} from './presets/selectedDeckNamePreset.js';

export function getDeckApiPresets(): CategorizedPresets {
	return {
		selectDeck: selectDeckPreset(),
		selectNextDeck: selectNextDeckPreset(),
		selectPreviousDeck: selectPreviousDeckPreset(),
		selectedDeckName: selectedDeckNamePreset()
	};
}
