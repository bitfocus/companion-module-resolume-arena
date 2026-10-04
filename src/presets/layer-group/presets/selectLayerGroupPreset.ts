import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults.js';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectLayerGroupPreset(category: string): CategorizedPreset {
	return {
		type: 'simple',
		category,
		name: 'Select Layer Group',
		style: {
			size: '14',
			text: 'Select Layer Group',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [
			{
				down: [
					{
						actionId: 'selectLayerGroup',
						options: {
							layerGroup: '1'
						}
					}
				],
				up: []
			}
		],
		feedbacks: [
			{
				feedbackId: 'layerGroupSelected',
				options: {
					layerGroup: '1'
				},
				style: getDefaultStyleGreen()
			}
		]
	};
}