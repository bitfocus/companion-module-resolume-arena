import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectedDeckNamePreset(): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Selected Deck Name',
	style: {
		size: '14',
		text: 'Selected Deck Name',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'selectedDeckName',
			options: {},
		},
	],
}}