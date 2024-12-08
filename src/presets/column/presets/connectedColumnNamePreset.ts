import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function connectedColumnNamePreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Connected Column Name',
	style: {
		size: '14',
		text: 'Connected Column Name',
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 0),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'connectedColumnName',
			options: {},
		},
	],
}}
