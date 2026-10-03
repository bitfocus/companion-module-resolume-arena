import {CompanionPresetDefinitions} from '@companion-module/base';
import {connectPreviousColumnPreset} from './presets/connectPreviousColumnPreset.js';
import {selectedColumnNamePreset} from './presets/selectedColumnNamePreset.js';
import {connectColumnPreset} from './presets/connectColumnPreset.js';
import {selectColumnPreset} from './presets/selectColumnPreset.js';
import {connectNextColumnPreset} from './presets/connectNextColumnPreset.js';
import {selectPreviousColumnPreset} from './presets/selectPreviousColumnPreset.js';
import {selectNextColumnPreset} from './presets/selectNextColumnPreset.js';
import {connectedColumnNamePreset} from './presets/connectedColumnNamePreset.js';

export function getColumnApiPresets(): CompanionPresetDefinitions {
	return {
		connectColumnPreset: connectColumnPreset(),
		selectColumnPreset: selectColumnPreset(),
		connectNextColumnPreset: connectNextColumnPreset(),
		selectNextColumnPreset: selectNextColumnPreset(),
		connectPreviousColumnPreset: connectPreviousColumnPreset(),
		selectPreviousColumnPreset: selectPreviousColumnPreset(),
		connectedColumnName: connectedColumnNamePreset(),
		selectedColumnName: selectedColumnNamePreset(),
	};
}
