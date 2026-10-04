import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';
import {ResolumeArenaConfig} from '../config-fields.js';

export function upgrade_v3_7_0(
	_context: CompanionUpgradeContext<ResolumeArenaConfig>,
	props: CompanionStaticUpgradeProps<ResolumeArenaConfig, undefined>
): CompanionStaticUpgradeResult<ResolumeArenaConfig, undefined> {
	let updateActions = [];

	for (const action of props.actions) {
				if (action.options !== undefined && action.options.value !== undefined && action.actionId==='layerTransitionDurationChange') {
					const option = action.options.value;
					action.options.value = option.isExpression
						? {isExpression: true, value: `(${option.value}) / 100`}
						: {isExpression: false, value: +(option.value as number | string) / 100};
				}
			updateActions.push(action);
	}

	return {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: updateActions,
		updatedFeedbacks: []
	};
}
