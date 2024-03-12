import {combineRgb} from '@companion-module/base';
import {getDefaultStyleBlue} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function clearLayerGroupPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Clear Layer Group',
	style: {
		size: '14',
		text: 'Clear Layer Group',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'clearLayerGroup',
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
			feedbackId: 'layerGroupActive',
			options: {
				layerGroup: '1'
			},
			style: getDefaultStyleBlue()
		}
	]
}}