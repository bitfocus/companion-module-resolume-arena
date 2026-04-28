import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';
import {getDefaultLayerColumnOptions} from '../../../defaults.js';

export function triggerClipPreset(category: string): CompanionPresetDefinition {
	return {
		type: 'simple',
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
					// Numeric values — preset bundles the feedback option values
					// as the user sees them on first drop. Bundling the legacy
					// `'rgb(...)'` string form left the bgcolor as a string in
					// 4.3 and the button never colored. See feedback def above.
					color_connected: combineRgb(0, 255, 0),
					color_connected_selected: combineRgb(0, 255, 255),
					color_connected_preview: combineRgb(255, 255, 0),
					color_preview: combineRgb(255, 0, 0),
				}
			},
			{
				feedbackId: 'clipInfo',
				options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true}
			}
		]
	};
}
