import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition as CompanionButtonPresetDefinition} from '@companion-module/base';

export function disconnectAllPreset(_category: string): CompanionButtonPresetDefinition {return {
	type: 'simple',
	name: 'Disconnect All Clips',
	style: {
		size: '18',
		text: 'Disconnect All',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'disconnectAll',
					options: {},
				},
			],
			up: [],
		},
	],
	feedbacks: [],
}}
