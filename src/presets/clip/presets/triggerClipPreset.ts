import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';
import {getDefaultLayerColumnOptions, getDefaultStyleGreen} from '../../../defaults';

export function triggerClipPreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
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
				options: getDefaultLayerColumnOptions(),
				style: getDefaultStyleGreen()
			},
			{
				feedbackId: 'clipInfo',
				options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true}
			}
		]
	};
}