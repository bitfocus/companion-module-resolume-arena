import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function triggerPreviousLayerGroupColumnPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Trigger Previous Layer Group Column',
	style: {
		size: '14',
		text: 'Trigger Previous Layer Group Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0)
	},
	steps: [
		{
			down: [
				{
					actionId: 'triggerLayerGroupColumn',
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
			feedbackId: 'previousLayerGroupColumnName',
			options: {
				layerGroup: '1',
				previous: 1
			}
		}
	]
}}