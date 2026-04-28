import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';

export function upgrade_v3_0_1(
	_context: CompanionUpgradeContext<any>,
	props: CompanionStaticUpgradeProps<any, any>
): CompanionStaticUpgradeResult<any, any> {
	let updateActions = [];

	for (const action of props.actions) {
		switch (action.actionId) {
			case 'custom':
				if (action.options !== undefined && (action.options as any).relativeType === undefined) {
					(action.options as any).relativeType = 'n';
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
