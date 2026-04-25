import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function resyncTempoPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
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