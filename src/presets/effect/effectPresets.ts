import {CompanionPresetDefinitions} from '@companion-module/base';
import {effectBypassTogglePreset} from './effectBypassTogglePreset';
import {effectBypassClipTogglePreset} from './effectBypassClipTogglePreset';
import {effectParamIncreasePreset} from './effectParamIncreasePreset';
import {effectParamDecreasePreset} from './effectParamDecreasePreset';

export function getEffectApiPresets(category: string): CompanionPresetDefinitions {
	return {
		effectBypassToggle: effectBypassTogglePreset(category),
		effectBypassClipToggle: effectBypassClipTogglePreset(category),
		effectParamIncrease: effectParamIncreasePreset(category),
		effectParamDecrease: effectParamDecreasePreset(category),
	};
}
