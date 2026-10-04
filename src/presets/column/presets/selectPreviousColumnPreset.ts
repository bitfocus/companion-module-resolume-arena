import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectPreviousColumnPreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Column',
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
