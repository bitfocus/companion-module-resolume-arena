import {combineRgb} from '@companion-module/base';
import {getDefaultDeckOptions, getDefaultStyleGreen} from '../../../defaults.js';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectDeckPreset(): CategorizedPreset {return {
	type: 'simple',
	category: 'Deck',
	name: 'Select Deck By Index',
	style: {
		size: '14',
		text: 'Select Deck',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectDeck',
					options: {action: 'set', value: 1},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'deckName',
			options: {...getDefaultDeckOptions()},
		},
		{
			feedbackId: 'deckSelected',
			options: {...getDefaultDeckOptions()},
			style: getDefaultStyleGreen(),
		},
	],
}}