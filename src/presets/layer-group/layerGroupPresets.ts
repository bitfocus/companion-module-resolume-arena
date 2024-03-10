import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerGroupPreset} from './presets/bypassLayerGroupPreset';
import {soloLayerGroupPreset} from './presets/soloLayerGroupPreset';
import {clearLayerGroupPreset} from './presets/clearLayerGroupPreset';
import {selectLayerGroupPreset} from './presets/selectLayerGroupPreset';
import {triggerLayerGroupColumnPreset} from './presets/triggerLayerGroupColumnPreset';
import {triggerNextLayerGroupColumnPreset} from './presets/triggerNextLayerGroupColumnPreset';
import {triggerPreviousLayerGroupColumnPreset} from './presets/triggerPreviousLayerGroupColumnPreset';
import {selectedLayerGroupColumnNamePreset} from './presets/selectedLayerGroupColumnNamePreset';

export function getLayerGroupApiPresets(): CompanionPresetDefinitions {
	return {
		bypassLayerGroup: bypassLayerGroupPreset(),
		soloLayerGroup: soloLayerGroupPreset(),
		clearLayerGroup: clearLayerGroupPreset(),
		selectLayerGroup: selectLayerGroupPreset(),
		triggerLayerGroupColumn: triggerLayerGroupColumnPreset(),
		triggerNextLayerGroupColumn: triggerNextLayerGroupColumnPreset(),
		triggerPreviousLayerGroupColumn: triggerPreviousLayerGroupColumnPreset(),
		selectedLayerGroupColumnName: selectedLayerGroupColumnNamePreset(),
	};
}
