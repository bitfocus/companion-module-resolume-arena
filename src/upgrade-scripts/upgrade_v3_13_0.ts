import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext
} from '@companion-module/base';

export function upgrade_v3_13_0(
	_context: CompanionUpgradeContext<any>,
	props: CompanionStaticUpgradeProps<any, any>
): CompanionStaticUpgradeResult<any, any> {
	const updatedActions = [];

	for (const action of props.actions) {
		if (action.actionId === 'custom') {
			action.actionId = 'oscCustomCommand';
			updatedActions.push(action);
		}
		// Upstream added a lookupMode option to connectColumn; default legacy
		// buttons to 'byIndex'. API 2.0 stores each option as ExpressionOrValue.
		if (action.actionId === 'connectColumn' && action.options['lookupMode'] === undefined) {
			action.options['lookupMode'] = {isExpression: false, value: 'byIndex'};
			updatedActions.push(action);
		}
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	};
}
