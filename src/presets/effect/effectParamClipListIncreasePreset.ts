import {combineRgb} from '@companion-module/base';
import type {CategorizedPreset} from '../preset-structure.js';

export function effectParamClipListIncreasePreset(category: string): CategorizedPreset {
	return {
		type: 'simple',
		category,
		name: 'Increase Effect Parameter (Clip — from list)',
		style: {
			size: '14',
			text: 'FX +0.1\nClip',
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
