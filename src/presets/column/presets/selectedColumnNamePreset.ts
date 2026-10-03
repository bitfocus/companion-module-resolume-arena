import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset.js';

export function selectedColumnNamePreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Selected Column Name',
	style: {
		size: '14',
		text: 'Selected Column Name',
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 255),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'selectedColumnName',
			options: {},
		},
	],
}}
