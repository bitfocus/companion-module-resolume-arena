import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';
import {CompanionOptionValues} from '@companion-module/base/dist/module-api/input';

export function changeTemplateAdd10(category: string, entityName: string, paramName: string, isDecibels: boolean = false, options: CompanionOptionValues = {[entityName]: '1'}): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: paramName + ' Add ' + (isDecibels ? '3db' : '10%'),
		style: {
			size: 'auto',
			text: category+' '+paramName + (isDecibels ? ' +3db' : ' +10%'),
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [
			{
				down: [
					{
						actionId: entityName + paramName + 'Change',
						options: {
							...options,
							action: 'add',
							value: isDecibels ? 3 : 10
						}
					}
				],
				up: []
			}
		],
		feedbacks: []
	};
}