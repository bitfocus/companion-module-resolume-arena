import {CompanionStaticUpgradeScript} from '@companion-module/base';
import {ResolumeArenaConfig} from './config-fields';
import {upgrade_v1_0_4} from './upgrade-scripts/upgrade_v1_0_4';
import {upgrade_v3_0_1} from './upgrade-scripts/upgrade_v3_0_1';
import {upgrade_v3_5_2} from './upgrade-scripts/upgrade_v3_5_2';
import {upgrade_v3_7_0} from './upgrade-scripts/upgrade_v3_7_0';

export function getUpgradeScripts(): CompanionStaticUpgradeScript<ResolumeArenaConfig>[] {
	return [
		upgrade_v1_0_4,
		upgrade_v3_0_1,
		upgrade_v3_5_2,
		upgrade_v3_7_0
	];
}
