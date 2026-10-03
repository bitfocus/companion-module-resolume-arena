import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';

export function selectedLayerGroupColumnNamePreset(category: string): CategorizedPreset {
	return {
		type: 'simple',
		category,
		name: 'Selected Layer Group Column Name',
		style: {
			size: '14',
			text: 'Selected Layer Group Column Name',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'selectedLayerGroupColumnName',
				options: {
					layerGroup: '1'
				}
			}
		]
	};
}
