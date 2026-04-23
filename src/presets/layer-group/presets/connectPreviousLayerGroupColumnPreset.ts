import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectPreviousLayerGroupColumnPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Connect Previous Layer Group Column',
	style: {
		size: '14',
		text: 'Connect Previous Layer Group Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'connectLayerGroupColumn',
					options: {
						layerGroup: '1',
						action: 'subtract',
						value: 1
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'previousConnectedLayerGroupColumnName',
			options: {
				layerGroup: '1',
				previous: 1
			}
		}
	]
}}
