import {CompanionStaticUpgradeScript, CompanionUpgradeContext, CompanionStaticUpgradeProps, CompanionStaticUpgradeResult} from "@companion-module/base";
import {ResolumeArenaConfig} from "./config-fields";

export function getUpgradeScripts(): CompanionStaticUpgradeScript<ResolumeArenaConfig>[] {
	return [
		function (
			_context: CompanionUpgradeContext<ResolumeArenaConfig>,
			props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
		): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
			// upgrade_v1_0_4
			let updateActions = [];

			for (const action of props.actions) {
				switch (action.actionId) {
					case 'custom':
						if (action.options !== undefined && action.options.customCmd !== undefined) {
							action.options.customPath = action.options.customCmd;
							delete action.options.customCmd;
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
		},
		function (
			_context: CompanionUpgradeContext<ResolumeArenaConfig>,
			props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
		): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
			// upgrade_v3_0_1
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
		},
	];
}