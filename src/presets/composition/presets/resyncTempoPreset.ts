import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function resyncTempoPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Tempo',
	name: 'Resync Tempo',
	style: {
		size: '18',
		text: 'Resync Tempo',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'tempoResync',
					options: {},
				},
			],
			up: [],
		},
	],
	feedbacks: [],
}}