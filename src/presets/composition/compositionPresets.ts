import type {CategorizedPresets} from '../preset-structure.js';
import {tapTempoPreset} from './presets/tapTempoPreset.js';
import {resyncTempoPreset} from './presets/resyncTempoPreset.js';
import {disconnectAllPreset} from './presets/disconnectAllPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';

export function getCompositionApiPresets(category: string): CategorizedPresets {
	return {
		tapTempo: tapTempoPreset(category),
		resyncTempo: resyncTempoPreset(category),
		disconnectAll: disconnectAllPreset(category),
		changeCompositionSpeedSet100: changeTemplateSet100(category,'composition','Speed', false, {}),
		changeCompositionSpeedAdd10: changeTemplateAdd10(category,'composition','Speed', false, {}),
		changeCompositionSpeedSubtract10: changeTemplateSubtract10(category,'composition','Speed', false, {}),
		changeCompositionSpeedSet0: changeTemplateSet0(category,'composition','Speed', false, {}),
		changeCompositionMasterSet100: changeTemplateSet100(category,'composition','Master', false, {}),
		changeCompositionMasterAdd10: changeTemplateAdd10(category,'composition','Master', false, {}),
		changeCompositionMasterSubtract10: changeTemplateSubtract10(category,'composition','Master', false, {}),
		changeCompositionMasterSet0: changeTemplateSet0(category,'composition','Master', false, {}),
		changeCompositionOpacitySet100: changeTemplateSet100(category,'composition','Opacity', false, {}),
		changeCompositionOpacityAdd10: changeTemplateAdd10(category,'composition','Opacity', false, {}),
		changeCompositionOpacitySubtract10: changeTemplateSubtract10(category,'composition','Opacity', false, {}),
		changeCompositionOpacitySet0: changeTemplateSet0(category,'composition','Opacity', false, {}),
		changeCompositionVolumeSet100: changeTemplateSet100(category,'composition','Volume', true, {}),
		changeCompositionVolumeAdd10: changeTemplateAdd10(category,'composition','Volume', true, {}),
		changeCompositionVolumeSubtract10: changeTemplateSubtract10(category,'composition','Volume', true, {}),
		changeCompositionVolumeSet0: changeTemplateSet0(category,'composition','Volume', true, {}),
	};
}
