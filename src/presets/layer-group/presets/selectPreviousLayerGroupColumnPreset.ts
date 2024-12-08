import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectPreviousLayerGroupColumnPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Select Previous Layer Group Column',
	style: {
		size: '14',
		text: 'Select Previous Layer Group Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectLayerGroupColumn',
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
			feedbackId: 'previousSelectedLayerGroupColumnName',
			options: {
				layerGroup: '1',
				previous: 1
			}
		}
	]
}}
