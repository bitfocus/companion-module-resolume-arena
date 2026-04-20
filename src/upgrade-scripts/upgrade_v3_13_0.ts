import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields';

export function upgrade_v3_13_0(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
	const updatedActions = [];

	for (const action of props.actions) {
		if (action.actionId === 'custom') {
			action.actionId = 'oscCustomCommand';
			updatedActions.push(action);
		}
		if (action.actionId === 'connectColumn' && action.options['lookupMode'] === undefined) {
			action.options['lookupMode'] = 'byIndex';
			updatedActions.push(action);
		}
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	};
}
