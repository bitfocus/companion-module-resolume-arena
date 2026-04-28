import {combineRgb} from '@companion-module/base';
import {getDefaultDeckOptions, getDefaultStyleGreen} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectDeckPreset(): CompanionPresetDefinition {return {
	type: 'simple',
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