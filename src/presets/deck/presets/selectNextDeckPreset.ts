import {combineRgb} from '@companion-module/base';
import {CompanionButtonPresetDefinition} from '@companion-module/base/dist/module-api/preset';

export function selectNextDeckPreset(): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category: 'Deck',
		name: 'Select Next Deck',
		style: {
			size: '14',
			text: 'Select Next Deck',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0)
		},
		steps: [
			{
				down: [
					{
						actionId: 'selectNextDeck',
						options: {}
					}
				],
				up: []
			}
		],
		feedbacks: [
			{
				feedbackId: 'nextDeckName',
				options: {
					next: 1
				}
			}
		]
	};
}
