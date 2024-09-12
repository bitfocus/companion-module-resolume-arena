import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectPreviousDeckPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Deck',
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
