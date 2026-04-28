import {combineRgb} from '@companion-module/base';
import {getDefaultStyleGreen} from '../../../defaults.js';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectLayerGroupColumnPreset(category: string): CompanionPresetDefinition {return {
	type: 'simple',
	name: 'Connect Layer Group Column',
	style: {
		size: '14',
		text: 'Connect Layer Group Column',
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
			feedbackId: 'layerGroupColumnsConnected',
			options: {
				column: '1',
				layerGroup: '1'
			},
			style: getDefaultStyleGreen()
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
