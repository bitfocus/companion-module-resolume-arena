import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectNextLayerGroupColumnPreset(category: string): CategorizedPreset {return {
	type: 'simple',
	category,
	name: 'Select Next Layer Group Column',
	style: {
		size: '14',
		text: 'Select Next Layer Group Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectLayerGroupColumn',
					options: {
						layerGroup: '1',
						action: 'add',
						value: 1
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'nextSelectedLayerGroupColumnName',
			options: {
				layerGroup: '1',
				next: 1
			}
		}
	]
}}
