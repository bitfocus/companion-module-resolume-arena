import {CompanionPresetDefinitions} from '@companion-module/base';
import {bypassLayerPreset} from './presets/bypassLayerPreset.js';
import {soloLayerPreset} from './presets/soloLayerPreset.js';
import {clearLayerPreset} from './presets/clearLayerPreset.js';
import {selectLayerPreset} from './presets/selectLayerPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getLayerApiPresetBundle(category: string): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const controlIds: string[] = [];
	const masterIds: string[] = [];
	const opacityIds: string[] = [];
	const volumeIds: string[] = [];

	// Control
	presets.selectLayer = selectLayerPreset(category); controlIds.push('selectLayer');
	presets.bypassLayer = bypassLayerPreset(category); controlIds.push('bypassLayer');
	presets.soloLayer = soloLayerPreset(category);     controlIds.push('soloLayer');
	presets.clearLayer = clearLayerPreset(category);   controlIds.push('clearLayer');

	// Master
	presets.changeLayerMasterSet100 = changeTemplateSet100(category, 'layer', 'Master');        masterIds.push('changeLayerMasterSet100');
	presets.changeLayerMasterAdd10 = changeTemplateAdd10(category, 'layer', 'Master');          masterIds.push('changeLayerMasterAdd10');
	presets.changeLayerMasterSubtract10 = changeTemplateSubtract10(category, 'layer', 'Master'); masterIds.push('changeLayerMasterSubtract10');
	presets.changeLayerMasterSet0 = changeTemplateSet0(category, 'layer', 'Master');             masterIds.push('changeLayerMasterSet0');

	// Opacity
	presets.changeLayerOpacitySet100 = changeTemplateSet100(category, 'layer', 'Opacity');        opacityIds.push('changeLayerOpacitySet100');
	presets.changeLayerOpacityAdd10 = changeTemplateAdd10(category, 'layer', 'Opacity');          opacityIds.push('changeLayerOpacityAdd10');
	presets.changeLayerOpacitySubtract10 = changeTemplateSubtract10(category, 'layer', 'Opacity'); opacityIds.push('changeLayerOpacitySubtract10');
	presets.changeLayerOpacitySet0 = changeTemplateSet0(category, 'layer', 'Opacity');             opacityIds.push('changeLayerOpacitySet0');

	// Volume
	presets.changeLayerVolumeSet100 = changeTemplateSet100(category, 'layer', 'Volume', true);        volumeIds.push('changeLayerVolumeSet100');
	presets.changeLayerVolumeAdd10 = changeTemplateAdd10(category, 'layer', 'Volume', true);          volumeIds.push('changeLayerVolumeAdd10');
	presets.changeLayerVolumeSubtract10 = changeTemplateSubtract10(category, 'layer', 'Volume', true); volumeIds.push('changeLayerVolumeSubtract10');
	presets.changeLayerVolumeSet0 = changeTemplateSet0(category, 'layer', 'Volume', true);             volumeIds.push('changeLayerVolumeSet0');

	const groups: PresetSubGroup[] = [];
	if (controlIds.length) groups.push({id: 'layer_control', type: 'simple', name: 'Control', presets: controlIds});
	if (masterIds.length)  groups.push({id: 'layer_master',  type: 'simple', name: 'Master',  presets: masterIds});
	if (opacityIds.length) groups.push({id: 'layer_opacity', type: 'simple', name: 'Opacity', presets: opacityIds});
	if (volumeIds.length)  groups.push({id: 'layer_volume',  type: 'simple', name: 'Volume',  presets: volumeIds});

	return {
		section: {id: 'layer', name: 'Layer', definitions: groups},
		presets,
	};
}
