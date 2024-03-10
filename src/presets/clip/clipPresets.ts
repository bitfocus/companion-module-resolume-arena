import {CompanionPresetDefinitions} from '@companion-module/base';
import {triggerClipPreset} from './presets/triggerClipPreset';
import {selectClipPreset} from './presets/selectClipPreset';

export function getClipApiPresets(): CompanionPresetDefinitions {
	return {
		triggerClip: triggerClipPreset(),
		selectClip: selectClipPreset(),
	};
}
