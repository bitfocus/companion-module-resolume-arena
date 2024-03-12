import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';
import {CompanionOptionValues} from '@companion-module/base/dist/module-api/input';

export function changeTemplateSet0(category: string, entityName: string, paramName: string, isDecibels: boolean = false, options: CompanionOptionValues = {[entityName]: '1'}): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: paramName + ' set ' + (isDecibels ? '-192db' : '0%'),
		style: {
			size: 'auto',
			text: category+' '+paramName + ' set ' + (isDecibels ? '-192db' : '0%'),
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
							action: 'set',
							value: isDecibels ? -192 : 0
						}
					}
				],
				up: []
			}
		],
		feedbacks: []
	};
}