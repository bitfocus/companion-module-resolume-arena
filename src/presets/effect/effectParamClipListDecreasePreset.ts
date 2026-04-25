import {combineRgb, CompanionPresetDefinition} from '@companion-module/base';

export function effectParamClipListDecreasePreset(category: string): CompanionPresetDefinition {
	return {
		type: 'simple',
		
		name: 'Decrease Effect Parameter (Clip — from list)',
		style: {
			size: '14',
			text: 'FX -0.1\nClip',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'effectParameterSetClipList',
						options: {
							effectChoice: '__manual__',
							layer: '1',
							column: '1',
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
