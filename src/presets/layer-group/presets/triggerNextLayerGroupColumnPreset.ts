import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function triggerNextLayerGroupColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Layer Group',
	name: 'Trigger Next Layer Group Column',
	style: {
		size: '14',
		text: 'Trigger Next Layer Group Column',
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
			feedbackId: 'nextLayerGroupColumnName',
			options: {
				layerGroup: '1',
				next: 1
			}
		}
	]
}}