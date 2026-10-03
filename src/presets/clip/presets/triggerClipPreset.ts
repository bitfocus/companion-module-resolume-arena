import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../../preset-structure.js';
import {getDefaultLayerColumnOptions} from '../../../defaults.js';

export function triggerClipPreset(category: string): CategorizedPreset {
	return {
		type: 'simple',
		category,
		name: 'Trigger Clip',
		style: {
			size: '18',
			text: 'Play Clip',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [
			{
				down: [
					{
						actionId: 'triggerClip',
						options: getDefaultLayerColumnOptions()
					}
				],
				up: []
			}
		],
		feedbacks: [
			{
				feedbackId: 'connectedClip',
				options: {
					...getDefaultLayerColumnOptions(),
					color_connected: 'rgb(0, 255, 0)',
					color_connected_selected: 'rgb(0,255,255)',
					color_connected_preview: 'rgb(255, 255, 0)',
					color_preview: 'rgb(255, 0, 0)'
				}
			},
			{
				feedbackId: 'clipInfo',
				options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true}
			}
		]
	};
}
