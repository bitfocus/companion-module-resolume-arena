import {CompanionPresetDefinitions} from '@companion-module/base';
import {tapTempoPreset} from './presets/tapTempoPreset.js';
import {resyncTempoPreset} from './presets/resyncTempoPreset.js';
import {disconnectAllPreset} from './presets/disconnectAllPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getCompositionApiPresetBundle(category: string): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const tempoIds: string[] = [];
	const masterIds: string[] = [];
	const opacityIds: string[] = [];
	const volumeIds: string[] = [];
	const speedIds: string[] = [];
	const controlIds: string[] = [];

	// Control
	presets.disconnectAll = disconnectAllPreset(category);  controlIds.push('disconnectAll');

	// Tempo
	presets.tapTempo = tapTempoPreset(category);            tempoIds.push('tapTempo');
	presets.resyncTempo = resyncTempoPreset(category);      tempoIds.push('resyncTempo');

	// Master
	presets.changeCompositionMasterSet100 = changeTemplateSet100(category, 'composition', 'Master');       masterIds.push('changeCompositionMasterSet100');
	presets.changeCompositionMasterAdd10 = changeTemplateAdd10(category, 'composition', 'Master');          masterIds.push('changeCompositionMasterAdd10');
	presets.changeCompositionMasterSubtract10 = changeTemplateSubtract10(category, 'composition', 'Master'); masterIds.push('changeCompositionMasterSubtract10');
	presets.changeCompositionMasterSet0 = changeTemplateSet0(category, 'composition', 'Master');             masterIds.push('changeCompositionMasterSet0');

	// Opacity
	presets.changeCompositionOpacitySet100 = changeTemplateSet100(category, 'composition', 'Opacity');         opacityIds.push('changeCompositionOpacitySet100');
	presets.changeCompositionOpacityAdd10 = changeTemplateAdd10(category, 'composition', 'Opacity');           opacityIds.push('changeCompositionOpacityAdd10');
	presets.changeCompositionOpacitySubtract10 = changeTemplateSubtract10(category, 'composition', 'Opacity');  opacityIds.push('changeCompositionOpacitySubtract10');
	presets.changeCompositionOpacitySet0 = changeTemplateSet0(category, 'composition', 'Opacity');              opacityIds.push('changeCompositionOpacitySet0');

	// Volume
	presets.changeCompositionVolumeSet100 = changeTemplateSet100(category, 'composition', 'Volume', true);        volumeIds.push('changeCompositionVolumeSet100');
	presets.changeCompositionVolumeAdd10 = changeTemplateAdd10(category, 'composition', 'Volume', true);          volumeIds.push('changeCompositionVolumeAdd10');
	presets.changeCompositionVolumeSubtract10 = changeTemplateSubtract10(category, 'composition', 'Volume', true); volumeIds.push('changeCompositionVolumeSubtract10');
	presets.changeCompositionVolumeSet0 = changeTemplateSet0(category, 'composition', 'Volume', true);             volumeIds.push('changeCompositionVolumeSet0');

	// Speed
	presets.changeCompositionSpeedSet100 = changeTemplateSet100(category, 'composition', 'Speed');        speedIds.push('changeCompositionSpeedSet100');
	presets.changeCompositionSpeedAdd10 = changeTemplateAdd10(category, 'composition', 'Speed');          speedIds.push('changeCompositionSpeedAdd10');
	presets.changeCompositionSpeedSubtract10 = changeTemplateSubtract10(category, 'composition', 'Speed'); speedIds.push('changeCompositionSpeedSubtract10');
	presets.changeCompositionSpeedSet0 = changeTemplateSet0(category, 'composition', 'Speed');             speedIds.push('changeCompositionSpeedSet0');

	// Assemble — order here is the UI order (array-ordered inside a section).
	const groups: PresetSubGroup[] = [];
	if (controlIds.length) groups.push({id: 'composition_control', type: 'simple', name: 'Control', presets: controlIds});
	if (tempoIds.length)   groups.push({id: 'composition_tempo',   type: 'simple', name: 'Tempo',   presets: tempoIds});
	if (masterIds.length)  groups.push({id: 'composition_master',  type: 'simple', name: 'Master',  presets: masterIds});
	if (opacityIds.length) groups.push({id: 'composition_opacity', type: 'simple', name: 'Opacity', presets: opacityIds});
	if (volumeIds.length)  groups.push({id: 'composition_volume',  type: 'simple', name: 'Volume',  presets: volumeIds});
	if (speedIds.length)   groups.push({id: 'composition_speed',   type: 'simple', name: 'Speed',   presets: speedIds});

	return {
		section: {id: 'composition', name: 'Composition', definitions: groups},
		presets,
	};
}
