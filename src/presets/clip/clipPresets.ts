import {CompanionPresetDefinitions} from '@companion-module/base';
import {triggerClipPreset} from './presets/triggerClipPreset';
import {selectClipPreset} from './presets/selectClipPreset';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0';
import {getDefaultLayerColumnOptions} from '../../defaults';

export function getClipApiPresets(category: string): CompanionPresetDefinitions {
	return {
		triggerClip: triggerClipPreset(category),
		selectClip: selectClipPreset(category),
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
