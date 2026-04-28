import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectPreviousColumnPreset(): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Select Previous Column',
	style: {
		size: '14',
		text: 'Select Previous Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectColumn',
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
			feedbackId: 'previousSelectedColumnName',
			options: {
				previous: 1,
			},
		},
	],
}}
