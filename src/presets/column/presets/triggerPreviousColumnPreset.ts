import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function triggerPreviousColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Trigger Previous Column',
	style: {
		size: '14',
		text: 'Trigger Previous Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'triggerColumn',
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
			feedbackId: 'previousColumnName',
			options: {
				previous: 1,
			},
		},
	],
}}