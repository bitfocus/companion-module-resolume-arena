import {combineRgb} from '@companion-module/base';
import {getDefaultStyleBlue} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function clearLayerPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Clear Layer',
	style: {
		size: '14',
		text: 'Clear Layer',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'clearLayer',
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
			feedbackId: 'layerActive',
			options: {
				layer: '1',
			},
			style: getDefaultStyleBlue(),
		},
	],
}}