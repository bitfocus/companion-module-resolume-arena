import {CompanionPresetDefinitions} from '@companion-module/base';
import {triggerClipPreset} from './presets/triggerClipPreset.js';
import {selectClipPreset} from './presets/selectClipPreset.js';
import {changeTemplateSet100} from '../template/changeLayerGroupMasterSet100.js';
import {changeTemplateAdd10} from '../template/changeLayerGroupMasterAdd10.js';
import {changeTemplateSubtract10} from '../template/changeLayerGroupMasterSubtract10.js';
import {changeTemplateSet0} from '../template/changeLayerGroupMasterSet0.js';
import {getDefaultLayerColumnOptions} from '../../defaults.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getClipApiPresetBundle(category: string): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const transportIds: string[] = [];
	const opacityIds: string[] = [];
	const volumeIds: string[] = [];
	const speedIds: string[] = [];

	// Transport
	presets.triggerClip = triggerClipPreset(category); transportIds.push('triggerClip');
	presets.selectClip = selectClipPreset(category);   transportIds.push('selectClip');

	// Opacity
	presets.changeClipOpacitySet100 = changeTemplateSet100(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions());        opacityIds.push('changeClipOpacitySet100');
	presets.changeClipOpacityAdd10 = changeTemplateAdd10(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions());          opacityIds.push('changeClipOpacityAdd10');
	presets.changeClipOpacitySubtract10 = changeTemplateSubtract10(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions()); opacityIds.push('changeClipOpacitySubtract10');
	presets.changeClipOpacitySet0 = changeTemplateSet0(category, 'clip', 'Opacity', false, getDefaultLayerColumnOptions());             opacityIds.push('changeClipOpacitySet0');

	// Volume
	presets.changeClipVolumeSet100 = changeTemplateSet100(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions());        volumeIds.push('changeClipVolumeSet100');
	presets.changeClipVolumeAdd10 = changeTemplateAdd10(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions());          volumeIds.push('changeClipVolumeAdd10');
	presets.changeClipVolumeSubtract10 = changeTemplateSubtract10(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions()); volumeIds.push('changeClipVolumeSubtract10');
	presets.changeClipVolumeSet0 = changeTemplateSet0(category, 'clip', 'Volume', true, getDefaultLayerColumnOptions());             volumeIds.push('changeClipVolumeSet0');

	// Speed
	presets.changeClipSpeedSet100 = changeTemplateSet100(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions());        speedIds.push('changeClipSpeedSet100');
	presets.changeClipSpeedAdd10 = changeTemplateAdd10(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions());          speedIds.push('changeClipSpeedAdd10');
	presets.changeClipSpeedSubtract10 = changeTemplateSubtract10(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions()); speedIds.push('changeClipSpeedSubtract10');
	presets.changeClipSpeedSet0 = changeTemplateSet0(category, 'clip', 'Speed', false, getDefaultLayerColumnOptions());             speedIds.push('changeClipSpeedSet0');

	const groups: PresetSubGroup[] = [];
	if (transportIds.length) groups.push({id: 'clip_transport', type: 'simple', name: 'Transport', presets: transportIds});
	if (opacityIds.length)   groups.push({id: 'clip_opacity',   type: 'simple', name: 'Opacity',   presets: opacityIds});
	if (volumeIds.length)    groups.push({id: 'clip_volume',    type: 'simple', name: 'Volume',    presets: volumeIds});
	if (speedIds.length)     groups.push({id: 'clip_speed',     type: 'simple', name: 'Speed',     presets: speedIds});

	return {
		section: {id: 'clip', name: 'Clip', definitions: groups},
		presets,
	};
}
