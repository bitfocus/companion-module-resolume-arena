import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';
import {getDefaultLayerColumnOptions} from '../../../defaults';

export function updateClipThumbnailPreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
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
