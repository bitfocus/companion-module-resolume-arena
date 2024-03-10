import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function tapTempoPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Tempo',
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