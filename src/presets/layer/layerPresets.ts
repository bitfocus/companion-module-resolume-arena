import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerPreset} from './presets/bypassLayerPreset';
import {soloLayerPreset} from './presets/soloLayerPreset';
import {clearLayerPreset} from './presets/clearLayerPreset';
import {selectLayerPreset} from './presets/selectLayerPreset';

export function getLayerApiPresets(): CompanionPresetDefinitions {
	return {
		bypassLayer: bypassLayerPreset(),
		soloLayer: soloLayerPreset(),
		clearLayer: clearLayerPreset(),
		selectLayer: selectLayerPreset(),
	};
}
