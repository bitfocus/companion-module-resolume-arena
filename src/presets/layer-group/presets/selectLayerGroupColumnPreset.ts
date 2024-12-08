import {combineRgb} from '@companion-module/base';
import {getDefaultStyleCyan} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectLayerGroupColumnPreset(category: string): CompanionButtonPresetDefinition {return {
	type: 'button',
	category,
	name: 'Select Layer Group Column',
	style: {
		size: '14',
		text: 'Select Layer Group Column',
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
						action: 'set',
						value: 1
					}
				}
			],
			up: []
		}
	],
	feedbacks: [
		{
			feedbackId: 'layerGroupColumnsSelected',
			options: {
				column: '1',
				layerGroup: '1'
			},
			style: getDefaultStyleCyan()
		},
		{
			feedbackId: 'layerGroupColumnName',
			options: {
				layerGroup: '1',
				column: '1'
			}
		}

	]
}}
