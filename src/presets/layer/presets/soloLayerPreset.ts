import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function soloLayerPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Solo Layer',
	style: {
		size: '14',
		text: 'Solo Layer',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'soloLayer',
					options: {
						layer: '1',
						solo: 'toggle',
					},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'layerSolo',
			options: {
				layer: '1',
			},
			style: getDefaultStyleGreen(),
		},
	],
}}