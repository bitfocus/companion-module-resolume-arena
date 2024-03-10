import {CompanionPresetDefinitions} from '@companion-module/base';
import {getClipApiPresets} from './presets/clip/clipPresets';
import {getColumnApiPresets} from './presets/column/columnPresets';
import {getDeckApiPresets} from './presets/deck/deckPresets';
import {getLayerGroupApiPresets} from './presets/layer-group/layerGroupPresets';
import {getCompositionApiPresets} from './presets/composition/compositionPresets';
import {getLayerApiPresets} from './presets/layer/layerPresets';

export function getApiPresets(): CompanionPresetDefinitions {
	return {
		...getClipApiPresets(),
		...getColumnApiPresets(),
		...getCompositionApiPresets(),
		...getDeckApiPresets(),
		...getLayerApiPresets(),
		...getLayerGroupApiPresets(),
	};
}
