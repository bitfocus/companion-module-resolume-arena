import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function connectPreviousLayerGroupColumnPreset(category: string): CategorizedPreset {return {
	type: 'simple',
	category,
	name: 'Connect Previous Layer Group Column',
	style: {
		size: '14',
		text: 'Connect Previous Layer Group Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'connectLayerGroupColumn',
					options: {
						layerGroup: '1',
						action: 'subtract',
						value: 1
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'previousConnectedLayerGroupColumnName',
			options: {
				layerGroup: '1',
				previous: 1
			}
		}
	]
}}
