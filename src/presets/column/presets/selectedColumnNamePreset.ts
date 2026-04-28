import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectedColumnNamePreset(): CompanionPresetDefinition {return {
	type: 'simple',
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
