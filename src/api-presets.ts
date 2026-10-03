import {CompanionPresetDefinitions} from '@companion-module/base';
import {getClipApiPresets} from './presets/clip/clipPresets.js';
import {getColumnApiPresets} from './presets/column/columnPresets.js';
import {getDeckApiPresets} from './presets/deck/deckPresets.js';
import {getEffectApiPresets} from './presets/effect/effectPresets.js';
import {getLayerGroupApiPresets} from './presets/layer-group/layerGroupPresets.js';
import {getCompositionApiPresets} from './presets/composition/compositionPresets.js';
import {getLayerApiPresets} from './presets/layer/layerPresets.js';

export function getApiPresets(instanceLabel: string): CompanionPresetDefinitions {
	return {
		...getClipApiPresets('Clip'),
		...getColumnApiPresets(),
		...getCompositionApiPresets('Composition'),
		...getDeckApiPresets(),
		...getEffectApiPresets('Effect'),
		...getLayerApiPresets('Layer', instanceLabel),
		...getLayerGroupApiPresets('Layer Group'),
	};
}
