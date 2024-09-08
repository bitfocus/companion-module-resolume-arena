import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields';

export function upgrade_v3_0_1(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
	let updateActions = [];

	for (const action of props.actions) {
		switch (action.actionId) {
			case 'custom':
				if (action.options !== undefined && action.options.relativeType === undefined) {
					action.options.relativeType = 'n';
					updateActions.push(action);
				}
				break;
		}
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: [],
	};
}
