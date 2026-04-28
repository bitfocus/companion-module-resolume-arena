import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectedColumnNamePreset(): CompanionPresetDefinition {return {
	type: 'simple',
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
