import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectNextColumnPreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Column',
	name: 'Select Next Column',
	style: {
		size: '14',
		text: 'Select Next Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectColumn',
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
			feedbackId: 'nextSelectedColumnName',
			options: {
				next: 1,
			},
		},
	],
}}
