import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectedColumnNamePreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Selected Column Name',
	style: {
		size: '14',
		text: 'Selected Column Name',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'selectedColumnName',
			options: {},
		},
	],
}}