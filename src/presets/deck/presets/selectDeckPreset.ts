import {combineRgb} from '@companion-module/base';
import {getDefaultDeckOptions, getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectDeckPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
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