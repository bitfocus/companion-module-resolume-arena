import {combineRgb, CompanionPresetDefinition} from '@companion-module/base';

export function effectBypassTogglePreset(category: string): CompanionPresetDefinition {
	return {
		type: 'simple',
		
		name: 'Toggle Effect Bypass (Layer)',
		style: {
			size: '14',
			text: 'FX Bypass\nLayer 1',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'effectBypassLayer',
						options: {
							effectChoice: '__manual__',
							layer: '1',
							effectIdx: '1',
							bypass: 'toggle',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'effectBypassedLayer',
				options: {
					effectChoice: '__manual__',
					layer: '1',
					effectIdx: '1',
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(200, 0, 0),
				},
			},
		],
	};
}
