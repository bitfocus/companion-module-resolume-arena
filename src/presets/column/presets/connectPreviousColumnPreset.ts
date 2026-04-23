import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectPreviousColumnPreset(): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Connect Previous Column',
	style: {
		size: '14',
		text: 'Connect Previous Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'connectColumn',
					options: {
						action: 'subtract',
						value: 1,
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'previousConnectedColumnName',
			options: {
				previous: 1,
			},
		},
	],
}}
