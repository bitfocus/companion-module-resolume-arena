import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function effectBypassClipTogglePreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: 'Toggle Effect Bypass (Clip)',
		style: {
			size: '14',
			text: 'FX Bypass',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'effectBypassClip',
						options: {
							layer: '1',
							column: '1',
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
				feedbackId: 'effectBypassedClip',
				options: {
					layer: '1',
					column: '1',
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
