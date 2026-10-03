import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectedColumnNamePreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Column',
	name: 'Selected Column Name',
	style: {
		size: '14',
		text: 'Selected Column Name',
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 255),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'selectedColumnName',
			options: {},
		},
	],
}}
