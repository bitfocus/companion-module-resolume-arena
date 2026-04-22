import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function effectParamDecreasePreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: 'Decrease Effect Parameter (Layer)',
		style: {
			size: '14',
			text: 'FX -',
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
							mode: 'decrease',
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
