import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function disconnectAllPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
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
