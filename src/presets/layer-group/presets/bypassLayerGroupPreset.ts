import {combineRgb} from '@companion-module/base';
import {getDefaultStyleRed} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function bypassLayerGroupPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Layer Group',
	name: 'Bypass Layer Group',
	style: {
		size: '14',
		text: 'Bypass Layer Group',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'bypassLayerGroup',
					options: {
						layerGroup: '1',
						bypass: 'toggle'
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'layerGroupBypassed',
			options: {
				layerGroup: '1'
			},
			style: getDefaultStyleRed()
		}
	]
}}