import {combineRgb, CompanionPresetDefinition} from '@companion-module/base';

export function effectParamIncreasePreset(category: string): CompanionPresetDefinition {
	return {
		type: 'simple',
		
		name: 'Increase Effect Parameter (Layer)',
		style: {
			size: '14',
			text: 'FX +0.1\nLayer 1',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'effectParameterSetLayer',
						options: {
							effectChoice: '__manual__',
							layer: '1',
							effectIdx: '1',
							collection: 'params',
							paramChoice_params: '__manual_param__',
							paramName: '',
							mode: 'increase',
							value: '0.1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	};
}
