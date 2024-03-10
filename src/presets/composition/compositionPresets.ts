import {CompanionPresetDefinitions} from '@companion-module/base';
import {tapTempoPreset} from './presets/tapTempoPreset';
import {resyncTempoPreset} from './presets/resyncTempoPreset';

export function getCompositionApiPresets(): CompanionPresetDefinitions {
	return {
		tapTempo: tapTempoPreset(),
		resyncTempo: resyncTempoPreset(),
	};
}
