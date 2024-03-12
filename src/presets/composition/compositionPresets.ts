import {CompanionPresetDefinitions} from '@companion-module/base';
import {tapTempoPreset} from './presets/tapTempoPreset';
import {resyncTempoPreset} from './presets/resyncTempoPreset';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0';

export function getCompositionApiPresets(category: string): CompanionPresetDefinitions {
	return {
		tapTempo: tapTempoPreset(category),
		resyncTempo: resyncTempoPreset(category),
		changeCompositionSpeedSet100: changeTemplateSet100(category,'composition','Speed'),
		changeCompositionSpeedAdd10: changeTemplateAdd10(category,'composition','Speed'),
		changeCompositionSpeedSubtract10: changeTemplateSubtract10(category,'composition','Speed'),
		changeCompositionSpeedSet0: changeTemplateSet0(category,'composition','Speed'),
		changeCompositionMasterSet100: changeTemplateSet100(category,'composition','Master'),
		changeCompositionMasterAdd10: changeTemplateAdd10(category,'composition','Master'),
		changeCompositionMasterSubtract10: changeTemplateSubtract10(category,'composition','Master'),
		changeCompositionMasterSet0: changeTemplateSet0(category,'composition','Master'),
		changeCompositionOpacitySet100: changeTemplateSet100(category,'composition','Opacity'),
		changeCompositionOpacityAdd10: changeTemplateAdd10(category,'composition','Opacity'),
		changeCompositionOpacitySubtract10: changeTemplateSubtract10(category,'composition','Opacity'),
		changeCompositionOpacitySet0: changeTemplateSet0(category,'composition','Opacity'),
		changeCompositionVolumeSet100: changeTemplateSet100(category,'composition','Volume', true),
		changeCompositionVolumeAdd10: changeTemplateAdd10(category,'composition','Volume', true),
		changeCompositionVolumeSubtract10: changeTemplateSubtract10(category,'composition','Volume', true),
		changeCompositionVolumeSet0: changeTemplateSet0(category,'composition','Volume', true),
	};
}
