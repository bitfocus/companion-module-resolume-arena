import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';

export function upgrade_v3_5_2(
	_context: CompanionUpgradeContext<any>,
	props: CompanionStaticUpgradeProps<any, any>
): CompanionStaticUpgradeResult<any, any> {
	let updateFeedbacks = [];

	for (const feedback of props.feedbacks) {
		switch (feedback.feedbackId) {
			case 'connectedClip':
				if (feedback.options !== undefined && (feedback.options as any).color_connected === undefined) {
					(feedback.options as any).color_connected = 'rgb(0, 255, 0)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && (feedback.options as any).color_connected_selected === undefined) {
					(feedback.options as any).color_connected_selected = 'rgb(0, 255, 255)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && (feedback.options as any).color_connected_preview === undefined) {
					(feedback.options as any).color_connected_preview = 'rgb(255, 255, 0)';
					updateFeedbacks.push(feedback);
				}
				if (feedback.options !== undefined && (feedback.options as any).color_preview === undefined) {
					(feedback.options as any).color_preview = 'rgb(255, 0, 0)';
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
