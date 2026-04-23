import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {clearAllLayers} from './actions/clear-all-layers.js';
import {tempoTap} from './actions/tempo-tap.js';
import {tempoResync} from './actions/tempo-resync.js';
import {compositionMasterChange} from './actions/composition-master-change.js';
import {compositionOpacityChange} from './actions/composition-opacity-change.js';
import {compositionVolumeChange} from './actions/composition-volume-change.js';
import {compositionSpeedChange} from './actions/composition-speed-change.js';
import {disconnectAll} from './actions/disconnect-all.js';

export function getCompositionActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	return {
		clearAll: clearAllLayers(restApi, websocketApi, oscApi),
		disconnectAll: disconnectAll(restApi, websocketApi, oscApi),
		tempoTap: tempoTap(restApi, websocketApi, oscApi),
		tempoResync: tempoResync(restApi, websocketApi, oscApi),
		compositionMasterChange: compositionMasterChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionOpacityChange: compositionOpacityChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionVolumeChange: compositionVolumeChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionSpeedChange: compositionSpeedChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
	};
}
