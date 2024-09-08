import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields';

export function upgrade_v3_5_2(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
	let updateFeedbacks = [];

	for (const feedback of props.feedbacks) {
		switch (feedback.feedbackId) {
			case 'connectedClip':
				if (feedback.options !== undefined && feedback.options.color_connected === undefined) {
					feedback.options.color_connected = 'rgb(0, 255, 0)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_connected_selected === undefined) {
					feedback.options.color_connected_selected = 'rgb(0, 0, 255)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_connected_preview === undefined) {
					feedback.options.color_connected_preview = 'rgb(0, 255, 255)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_preview === undefined) {
					feedback.options.color_preview = 'rgb(255, 255, 0)';
					updateFeedbacks.push(feedback);
				}
				break;
		}
	}

	return {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: updateFeedbacks
	};
}
