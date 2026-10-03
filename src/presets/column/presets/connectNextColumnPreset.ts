import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function connectNextColumnPreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Column',
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
