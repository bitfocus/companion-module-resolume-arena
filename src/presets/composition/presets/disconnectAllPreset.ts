import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function disconnectAllPreset(category: string): CategorizedPreset {return {
	type: 'simple',
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
