import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function tapTempoPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Tap Tempo',
	style: {
		size: '18',
		text: 'Tap Tempo',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'tempoTap',
					options: {},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'tempo',
			options: {},
		},
	],
}}