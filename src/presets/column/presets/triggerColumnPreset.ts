import {combineRgb} from '@companion-module/base';
import {getDefaultColumnOptions, getDefaultStyleGreen} from '../../../defaults';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function triggerColumnPreset(): CompanionButtonPresetDefinition {return {
	type: 'button',
	category: 'Column',
	name: 'Trigger Column By Index',
	style: {
		size: '14',
		text: 'Trigger Column',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'triggerColumn',
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
			style: getDefaultStyleGreen(),
		},
	],
}}