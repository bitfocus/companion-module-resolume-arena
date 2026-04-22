import {CompanionPresetDefinitions} from '@companion-module/base';
import {effectBypassTogglePreset} from './effectBypassTogglePreset';
import {effectBypassClipTogglePreset} from './effectBypassClipTogglePreset';
import {effectBypassClipListTogglePreset} from './effectBypassClipListTogglePreset';
import {effectParamIncreasePreset} from './effectParamIncreasePreset';
import {effectParamDecreasePreset} from './effectParamDecreasePreset';
import {effectParamClipListIncreasePreset} from './effectParamClipListIncreasePreset';
import {effectParamClipListDecreasePreset} from './effectParamClipListDecreasePreset';

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
