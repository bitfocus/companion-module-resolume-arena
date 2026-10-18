import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';
import {getDefaultLayerColumnOptions} from '../../../defaults.js';

export function updateClipThumbnailPreset(category: string): CategorizedPreset {
	return {
		type: 'simple',
		category,
		name: 'Update Clip Thumbnail',
		style: {
			size: '14',
			text: 'Update Thumb',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 80, 160),
		},
		steps: [
			{
				down: [
					{
						actionId: 'updateClipThumbnail',
						options: {
							target: 'layerColumn',
							...getDefaultLayerColumnOptions(),
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	};
}
