import {combineRgb} from '@companion-module/base';
import {getDefaultColumnOptions, getDefaultStyleCyan, getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Select Column By Index',
	style: {
		size: '14',
		text: 'Select Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'selectColumn',
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
