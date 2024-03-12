import {CompanionPresetDefinitions} from '@companion-module/base';
import {triggerColumnPreset} from './presets/triggerColumnPreset';
import {triggerNextColumnPreset} from './presets/triggerNextColumnPreset';
import {triggerPreviousColumnPreset} from './presets/triggerPreviousColumnPreset';
import {selectedColumnNamePreset} from './presets/selectedColumnNamePreset';

export function getColumnApiPresets(): CompanionPresetDefinitions {
	return {
		triggerColumn: triggerColumnPreset(),
		triggerNextColumn: triggerNextColumnPreset(),
		triggerPreviousColumn: triggerPreviousColumnPreset(),
		selectedColumnName: selectedColumnNamePreset(),
	};
}
