import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields';

export function upgrade_v3_10_0(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
	let updateFeedbacks = [];

	for (const feedback of props.feedbacks) {
		switch (feedback.feedbackId) {
			case 'nextColumnName':
				feedback.feedbackId = 'nextSelectedColumnName'
					updateFeedbacks.push(feedback);
				break;
			case 'previousColumnName':
				feedback.feedbackId = 'previousSelectedColumnName'
					updateFeedbacks.push(feedback);
				break;
			case 'nextLayerGroupColumnName':
				feedback.feedbackId = 'nextSelectedLayerGroupColumnName'
					updateFeedbacks.push(feedback);
				break;
			case 'previousLayerGroupColumnName':
				feedback.feedbackId = 'previousSelectedLayerGroupColumnName'
					updateFeedbacks.push(feedback);
				break;
		}
	}

	let updateActions = [];

	for (const action of props.actions) {
		console.log(action);
		switch (action.actionId) {
			case 'triggerColumn':
				action.actionId = 'connectColumn'
				updateActions.push(action);
				break;
			case 'triggerLayerGroupColumn':
				action.actionId = 'connectLayerGroupColumn'
				updateActions.push(action);
				break;
		}
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: updateFeedbacks
	};
}
