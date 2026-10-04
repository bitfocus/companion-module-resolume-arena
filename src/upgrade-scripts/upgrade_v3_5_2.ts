import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields.js';

export function upgrade_v3_5_2(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig, undefined>
): CompanionStaticUpgradeResult<ResolumeArenaConfig, undefined> {
	let updateFeedbacks = [];

	for (const feedback of props.feedbacks) {
		switch (feedback.feedbackId) {
			case 'connectedClip':
				if (feedback.options !== undefined && feedback.options.color_connected === undefined) {
					feedback.options.color_connected = {isExpression: false, value: 'rgb(0, 255, 0)'};
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_connected_selected === undefined) {
					feedback.options.color_connected_selected = {isExpression: false, value: 'rgb(0, 255, 255)'};
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_connected_preview === undefined) {
					feedback.options.color_connected_preview = {isExpression: false, value: 'rgb(255, 255, 0)'};
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && feedback.options.color_preview === undefined) {
					feedback.options.color_preview = {isExpression: false, value: 'rgb(255, 0, 0)'};
					updateFeedbacks.push(feedback);
				}
				break;
		}
	}

	return {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: updateFeedbacks
	};
}
