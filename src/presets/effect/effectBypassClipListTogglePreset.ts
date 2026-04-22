import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function effectBypassClipListTogglePreset(category: string): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name: 'Toggle Effect Bypass (Clip — from list)',
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
						actionId: 'effectBypassClipList',
						options: {
							effectChoice: '__manual__',
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
				feedbackId: 'effectBypassedClipList',
				options: {
					effectChoice: '__manual__',
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
