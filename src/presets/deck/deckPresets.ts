import {CompanionPresetDefinitions} from '@companion-module/base';
import {selectDeckPreset} from './presets/selectDeckPreset.js';
import {selectNextDeckPreset} from './presets/selectNextDeckPreset.js';
import {selectPreviousDeckPreset} from './presets/selectPreviousDeckPreset.js';
import {selectedDeckNamePreset} from './presets/selectedDeckNamePreset.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getDeckApiPresetBundle(): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const displayIds: string[] = [];
	const selectionIds: string[] = [];

	presets.selectedDeckName = selectedDeckNamePreset();      displayIds.push('selectedDeckName');

	presets.selectDeck = selectDeckPreset();                  selectionIds.push('selectDeck');
	presets.selectPreviousDeck = selectPreviousDeckPreset();  selectionIds.push('selectPreviousDeck');
	presets.selectNextDeck = selectNextDeckPreset();          selectionIds.push('selectNextDeck');

	const groups: PresetSubGroup[] = [];
	if (displayIds.length)   groups.push({id: 'deck_displays',  type: 'simple', name: 'Displays',  presets: displayIds});
	if (selectionIds.length) groups.push({id: 'deck_selection', type: 'simple', name: 'Selection', presets: selectionIds});

	return {
		section: {id: 'deck', name: 'Deck', definitions: groups},
		presets,
	};
}
