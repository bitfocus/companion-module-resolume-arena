import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectNextColumnPreset(): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Connect Next Column',
	style: {
		size: '14',
		text: 'Connect Next Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'connectColumn',
					options: {
						action: 'add',
						value: 1,
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'nextConnectedColumnName',
			options: {
				next: 1,
			},
		},
	],
}}
