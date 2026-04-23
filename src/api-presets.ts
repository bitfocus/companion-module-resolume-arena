import type {CompanionPresetDefinitions} from '@companion-module/base';
import {getClipApiPresetBundle} from './presets/clip/clipPresets.js';
import {getColumnApiPresetBundle} from './presets/column/columnPresets.js';
import {getDeckApiPresetBundle} from './presets/deck/deckPresets.js';
import {getLayerGroupApiPresetBundle} from './presets/layer-group/layerGroupPresets.js';
import {getCompositionApiPresetBundle} from './presets/composition/compositionPresets.js';
import {getLayerApiPresetBundle} from './presets/layer/layerPresets.js';
import {getEffectApiPresetBundle} from './presets/effect/effectPresets.js';
import type {DomainPresetBundle, PresetSection} from './presets/types.js';

export interface ApiPresetResult {
	sections: PresetSection[];
	presets: CompanionPresetDefinitions;
}

// Top-level section ordering. Companion 4.3 sorts sections alphabetically by
// display name regardless of this order, but we keep the array logical so the
// code reads in the order a user thinks about it.
export function getApiPresetBundles(): ApiPresetResult {
	const bundles: DomainPresetBundle[] = [
		getCompositionApiPresetBundle('Composition'),
		getDeckApiPresetBundle(),
		getColumnApiPresetBundle(),
		getEffectApiPresetBundle('Effect'),
		getLayerApiPresetBundle('Layer'),
		getLayerGroupApiPresetBundle('Layer Group'),
		getClipApiPresetBundle('Clip'),
	];

	const sections: PresetSection[] = [];
	const presets: CompanionPresetDefinitions = {};
	for (const b of bundles) {
		if (b.section.definitions.length) sections.push(b.section);
		Object.assign(presets, b.presets);
	}
	return {sections, presets};
}
