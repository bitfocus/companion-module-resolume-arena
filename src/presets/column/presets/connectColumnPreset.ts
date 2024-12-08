import {combineRgb} from '@companion-module/base';
import {getDefaultColumnOptions, getDefaultStyleCyan, getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function connectColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Connect Column By Index',
	style: {
		size: '14',
		text: 'Connect Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'connectColumn',
					options: {action: 'set', value: 1},
				},
			],
			up: [],
		},
	],
	feedbacks: [
		{
			feedbackId: 'columnName',
			options: {...getDefaultColumnOptions()},
		},
		{
			feedbackId: 'columnSelected',
			options: {...getDefaultColumnOptions()},
			style: getDefaultStyleCyan(),
		},
		{
			feedbackId: 'columnConnected',
			options: {...getDefaultColumnOptions()},
			style: getDefaultStyleGreen(),
		},
	],
}}
