import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function connectedLayerGroupColumnNamePreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: 'Connected Layer Group Column Name',
		style: {
			size: '14',
			text: 'Connected Layer Group Column Name',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [],
		feedbacks: [
			{
				feedbackId: 'connectedLayerGroupColumnName',
				options: {
					layerGroup: '1'
				}
			}
		]
	};
}
