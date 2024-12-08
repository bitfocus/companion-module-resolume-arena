import {CompanionPresetDefinitions} from '@companion-module/base';
import {connectPreviousColumnPreset} from './presets/connectPreviousColumnPreset';
import {selectedColumnNamePreset} from './presets/selectedColumnNamePreset';
import {connectColumnPreset} from './presets/connectColumnPreset';
import {selectColumnPreset} from './presets/selectColumnPreset';
import {connectNextColumnPreset} from './presets/connectNextColumnPreset';
import {selectPreviousColumnPreset} from './presets/selectPreviousColumnPreset';
import {selectNextColumnPreset} from './presets/selectNextColumnPreset';
import {connectedColumnNamePreset} from './presets/connectedColumnNamePreset';

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
