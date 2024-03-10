import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectedDeckNamePreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Deck',
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