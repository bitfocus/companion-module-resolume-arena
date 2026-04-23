import {CompanionStaticUpgradeScript} from '@companion-module/base';
import {upgrade_v1_0_4} from './upgrade-scripts/upgrade_v1_0_4.js';
import {upgrade_v3_0_1} from './upgrade-scripts/upgrade_v3_0_1.js';
import {upgrade_v3_5_2} from './upgrade-scripts/upgrade_v3_5_2.js';
import {upgrade_v3_7_0} from './upgrade-scripts/upgrade_v3_7_0.js';
import {upgrade_v3_10_0} from './upgrade-scripts/upgrade_v3_10_0.js';
import {upgrade_v3_13_0} from './upgrade-scripts/upgrade_v3_13_0.js';
import {upgrade_v4_0_0} from './upgrade-scripts/upgrade_v4_0_0.js';

export const UpgradeScripts: CompanionStaticUpgradeScript<any>[] = [
	upgrade_v1_0_4,
	upgrade_v3_0_1,
	upgrade_v3_5_2,
	upgrade_v3_7_0,
	upgrade_v3_10_0,
	upgrade_v3_13_0,
	upgrade_v4_0_0,
];
