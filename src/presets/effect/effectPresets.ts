import {CompanionPresetDefinitions} from '@companion-module/base';
import {effectBypassTogglePreset} from './effectBypassTogglePreset.js';
import {effectBypassClipTogglePreset} from './effectBypassClipTogglePreset.js';
import {effectBypassClipListTogglePreset} from './effectBypassClipListTogglePreset.js';
import {effectParamIncreasePreset} from './effectParamIncreasePreset.js';
import {effectParamDecreasePreset} from './effectParamDecreasePreset.js';
import {effectParamClipListIncreasePreset} from './effectParamClipListIncreasePreset.js';
import {effectParamClipListDecreasePreset} from './effectParamClipListDecreasePreset.js';

export function getEffectApiPresets(category: string): CompanionPresetDefinitions {
	return {
		effectBypassToggle: effectBypassTogglePreset(category),
		effectBypassClipToggle: effectBypassClipTogglePreset(category),
		effectBypassClipListToggle: effectBypassClipListTogglePreset(category),
		effectParamIncrease: effectParamIncreasePreset(category),
		effectParamDecrease: effectParamDecreasePreset(category),
		effectParamClipListIncrease: effectParamClipListIncreasePreset(category),
		effectParamClipListDecrease: effectParamClipListDecreasePreset(category),
	};
}
