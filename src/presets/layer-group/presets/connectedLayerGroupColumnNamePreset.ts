import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function connectedLayerGroupColumnNamePreset(category: string): CompanionPresetDefinition {
	return {
		type: 'simple',
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
