import {CompanionStaticUpgradeScript} from '@companion-module/base';

// In API 2.0 upgrade scripts, each option value is an ExpressionOrValue wrapper:
//   { value: <raw>, isExpression: false } | { value: <exprString>, isExpression: true }
// We migrate any literal string that contained $(variable) references into an
// expression that calls parseVariables() at runtime, so Companion's expression
// engine resolves them (replacing the old parseVariablesInString module-side path).
export const upgrade_v4_0_0: CompanionStaticUpgradeScript<any, any> = function (_context, props) {
	const updatedActions: any[] = [];

	for (const action of props.actions) {
		if (!action.options) continue;
		let changed = false;
		for (const [key, wrapper] of Object.entries(action.options as Record<string, any>)) {
			if (!wrapper || typeof wrapper !== 'object') continue;
			if (wrapper.isExpression) continue;
			const value = wrapper.value;
			if (typeof value !== 'string' || !value.includes('$(')) continue;
			const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			(action.options as any)[key] = {
				isExpression: true,
				value: `parseVariables("${escaped}")`,
			};
			changed = true;
		}
		if (changed) updatedActions.push(action);
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	};
};
