import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectLayerPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Select Layer',
	style: {
		size: '14',
		text: 'Select Layer',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectLayer',
					options: {
						layer: '1',
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'layerSelected',
			options: {
				layer: '1',
			},
			style: getDefaultStyleGreen(),
		},
	],
}}