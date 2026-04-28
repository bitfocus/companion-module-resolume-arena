import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectLayerPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Select Layer',
	style: {
		size: '14',
		text: 'Select Layer',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectLayer',
					options: {
						layer: '1',
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'layerSelected',
			options: {
				layer: '1',
			},
			style: getDefaultStyleGreen(),
		},
	],
}}