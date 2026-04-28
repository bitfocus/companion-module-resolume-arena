import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';

export function upgrade_v3_7_0(
	_context: CompanionUpgradeContext<any>,
	props: CompanionStaticUpgradeProps<any, any>
): CompanionStaticUpgradeResult<any, any> {
	let updateActions = [];

	for (const action of props.actions) {
				if (action.options !== undefined && action.options.value !== undefined && action.actionId==='layerTransitionDurationChange') {
					(action.options as any).value = +(action.options as any).value/100;
				}
			updateActions.push(action);
	}

	return {
		updatedConfig: null,
		updatedActions: updateActions,
		updatedFeedbacks: []
	};
}
