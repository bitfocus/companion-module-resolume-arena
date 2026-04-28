import {combineRgb} from '@companion-module/base';
import {CompanionPresetDefinition} from '@companion-module/base';

export function selectNextDeckPreset(): CompanionPresetDefinition {
	return {
		type: 'simple',
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
