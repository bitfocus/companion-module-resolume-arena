import type {CategorizedPresets} from '../preset-structure.js';
import {triggerClipPreset} from './presets/triggerClipPreset.js';
import {selectClipPreset} from './presets/selectClipPreset.js';
import {updateClipThumbnailPreset} from './presets/updateClipThumbnailPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';
import {getDefaultLayerColumnOptions} from '../../defaults.js';

export function getClipApiPresets(category: string): CategorizedPresets {
	return {
		triggerClip: triggerClipPreset(category),
		selectClip: selectClipPreset(category),
		updateClipThumbnail: updateClipThumbnailPreset(category),
		changeClipSpeedSet100: changeTemplateSet100(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions()),
		changeClipSpeedAdd10: changeTemplateAdd10(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions()),
		changeClipSpeedSubtract10: changeTemplateSubtract10(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions()),
		changeClipSpeedSet0: changeTemplateSet0(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions()),
		changeClipOpacitySet100: changeTemplateSet100(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions()),
		changeClipOpacityAdd10: changeTemplateAdd10(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions()),
		changeClipOpacitySubtract10: changeTemplateSubtract10(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions()),
		changeClipOpacitySet0: changeTemplateSet0(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions()),
		changeClipVolumeSet100: changeTemplateSet100(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions()),
		changeClipVolumeAdd10: changeTemplateAdd10(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions()),
		changeClipVolumeSubtract10: changeTemplateSubtract10(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions()),
		changeClipVolumeSet0: changeTemplateSet0(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions())
	};
}
