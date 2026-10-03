import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields.js';

export function upgrade_v3_0_1(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig, undefined>
): CompanionStaticUpgradeResult<ResolumeArenaConfig, undefined> {
	let updateActions = [];

	for (const action of props.actions) {
		switch (action.actionId) {
			case 'custom':
				if (action.options !== undefined && action.options.relativeType === undefined) {
					action.options.relativeType = {isExpression: false, value: 'n'};
					updateActions.push(action);
				}
				break;
		}
	}

	return {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: updateActions,
		updatedFeedbacks: [],
	};
}
