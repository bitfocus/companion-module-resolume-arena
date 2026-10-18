import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function resyncTempoPreset(category: string): CategorizedPreset {return {
	type: 'simple',
	category,
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
					actionId: 'resyncTap',
					options: {},
				},
			],
			up: [],
		},
	],
	feedbacks: [],
}}