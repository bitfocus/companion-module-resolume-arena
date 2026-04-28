import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectPreviousDeckPreset(): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Select Previous Deck',
	style: {
		size: '14',
		text: 'Select Previous Deck',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectPreviousDeck',
					options: {
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'previousDeckName',
			options: {
				previous: 1,
			},
		},
	],
}}
