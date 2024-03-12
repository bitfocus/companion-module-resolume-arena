import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerPreset} from './presets/bypassLayerPreset';
import {soloLayerPreset} from './presets/soloLayerPreset';
import {clearLayerPreset} from './presets/clearLayerPreset';
import {selectLayerPreset} from './presets/selectLayerPreset';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0';

export function getLayerApiPresets(category: string): CompanionPresetDefinitions {
	return {
		bypassLayer: bypassLayerPreset(category),
		soloLayer: soloLayerPreset(category),
		clearLayer: clearLayerPreset(category),
		selectLayer: selectLayerPreset(category),
		changeLayerMasterSet100: changeTemplateSet100(category,'layer','Master'),
		changeLayerMasterAdd10: changeTemplateAdd10(category,'layer','Master'),
		changeLayerMasterSubtract10: changeTemplateSubtract10(category,'layer','Master'),
		changeLayerMasterSet0: changeTemplateSet0(category,'layer','Master'),
		changeLayerOpacitySet100: changeTemplateSet100(category,'layer','Opacity'),
		changeLayerOpacityAdd10: changeTemplateAdd10(category,'layer','Opacity'),
		changeLayerOpacitySubtract10: changeTemplateSubtract10(category,'layer','Opacity'),
		changeLayerOpacitySet0: changeTemplateSet0(category,'layer','Opacity'),
		changeLayerVolumeSet100: changeTemplateSet100(category,'layer','Volume', true),
		changeLayerVolumeAdd10: changeTemplateAdd10(category,'layer','Volume', true),
		changeLayerVolumeSubtract10: changeTemplateSubtract10(category,'layer','Volume', true),
		changeLayerVolumeSet0: changeTemplateSet0(category,'layer','Volume', true),
	};
}
