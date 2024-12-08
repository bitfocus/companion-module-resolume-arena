import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function connectNextLayerGroupColumnPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Connect Next Layer Group Column',
	style: {
		size: '14',
		text: 'Connect Next Layer Group Column',
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
						action: 'add',
						value: 1
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'nextConnectedLayerGroupColumnName',
			options: {
				layerGroup: '1',
				next: 1
			}
		}
	]
}}
