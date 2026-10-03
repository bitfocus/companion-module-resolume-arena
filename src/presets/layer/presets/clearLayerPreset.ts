import {combineRgb} from '@companion-module/base';
import {getDefaultStyleBlue} from '../../../defaults.js';
import type {CategorizedPreset} from '../../preset-structure.js';

export function clearLayerPreset(category: string): CategorizedPreset {return {
	type: 'simple',
	category,
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