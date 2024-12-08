import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function connectPreviousColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
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
