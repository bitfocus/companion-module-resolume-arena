import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';
import {combineRgb} from '@companion-module/base';
import {getDefaultLayerColumnOptions, getDefaultStyleBlue} from '../../../defaults';

export function selectClipPreset(category: string): CompanionButtonPresetDefinition{ return {
	type: 'button',
		category,
		name: 'Select Clip',
		style: {
		size: '18',
			text: 'Select Clip',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectClip',
					options: getDefaultLayerColumnOptions(),
				},
			],
			up: [],
		},
	],
		feedbacks: [
		{
			feedbackId: 'selectedClip',
			options: getDefaultLayerColumnOptions(),
			style: getDefaultStyleBlue(),
		},
		{
			feedbackId: 'clipInfo',
			options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true},
		},
	],
}}