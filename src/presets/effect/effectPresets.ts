import {CompanionPresetDefinitions} from '@companion-module/base';
import {effectBypassTogglePreset} from './effectBypassTogglePreset.js';
import {effectBypassClipTogglePreset} from './effectBypassClipTogglePreset.js';
import {effectBypassClipListTogglePreset} from './effectBypassClipListTogglePreset.js';
import {effectParamIncreasePreset} from './effectParamIncreasePreset.js';
import {effectParamDecreasePreset} from './effectParamDecreasePreset.js';
import {effectParamClipListIncreasePreset} from './effectParamClipListIncreasePreset.js';
import {effectParamClipListDecreasePreset} from './effectParamClipListDecreasePreset.js';
import type {DomainPresetBundle, PresetSubGroup} from '../types.js';

export function getEffectApiPresetBundle(category: string): DomainPresetBundle {
	const presets: CompanionPresetDefinitions = {};
	const bypassIds: string[] = [];
	const paramIds: string[] = [];

	presets.effectBypassToggle = effectBypassTogglePreset(category);             bypassIds.push('effectBypassToggle');
	presets.effectBypassClipToggle = effectBypassClipTogglePreset(category);     bypassIds.push('effectBypassClipToggle');
	presets.effectBypassClipListToggle = effectBypassClipListTogglePreset(category); bypassIds.push('effectBypassClipListToggle');

	presets.effectParamIncrease = effectParamIncreasePreset(category);                   paramIds.push('effectParamIncrease');
	presets.effectParamDecrease = effectParamDecreasePreset(category);                   paramIds.push('effectParamDecrease');
	presets.effectParamClipListIncrease = effectParamClipListIncreasePreset(category);   paramIds.push('effectParamClipListIncrease');
	presets.effectParamClipListDecrease = effectParamClipListDecreasePreset(category);   paramIds.push('effectParamClipListDecrease');

	const groups: PresetSubGroup[] = [];
	if (bypassIds.length) groups.push({id: 'effect_bypass', type: 'simple', name: 'Bypass', presets: bypassIds});
	if (paramIds.length)  groups.push({id: 'effect_param',  type: 'simple', name: 'Parameters', presets: paramIds});

	return {
		section: {id: 'effect', name: 'Effect', definitions: groups},
		presets,
	};
}
