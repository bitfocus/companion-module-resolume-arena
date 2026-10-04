import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function connectedColumnNamePreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Column',
	name: 'Connected Column Name',
	style: {
		size: '14',
		text: 'Connected Column Name',
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 0),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'connectedColumnName',
			options: {},
		},
	],
}}
