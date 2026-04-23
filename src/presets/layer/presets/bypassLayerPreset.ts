import {combineRgb} from '@companion-module/base';
import {getDefaultStyleRed} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function bypassLayerPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Bypass Layer',
	style: {
		size: '14',
		text: 'Bypass Layer',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'bypassLayer',
					options: {
						layer: '1',
						bypass: 'toggle',
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'layerBypassed',
			options: {
				layer: '1',
			},
			style: getDefaultStyleRed(),
		},
	],
}}