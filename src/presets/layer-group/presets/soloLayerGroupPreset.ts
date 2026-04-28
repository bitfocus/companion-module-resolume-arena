import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function soloLayerGroupPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Solo Layer Group',
	style: {
		size: '14',
		text: 'Solo Layer Group',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'soloLayerGroup',
					options: {
						layerGroup: '1',
						solo: 'toggle'
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'layerGroupSolo',
			options: {
				layerGroup: '1'
			},
			style: getDefaultStyleGreen()
		}
	]
}}