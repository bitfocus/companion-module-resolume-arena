import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields';

export function upgrade_v3_7_0(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
	let updateActions = [];

	for (const action of props.actions) {
				if (action.options !== undefined && action.options.value !== undefined && action.actionId==='layerTransitionDurationChange') {
					action.options.value = +action.options.value/100;
				}
			updateActions.push(action);
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: []
	};
}
