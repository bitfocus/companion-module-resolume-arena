import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectedDeckNamePreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Deck',
	name: 'Selected Deck Name',
	style: {
		size: '14',
		text: 'Selected Deck Name',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [],
	feedbacks: [
		{
			feedbackId: 'selectedDeckName',
			options: {},
		},
	],
}}