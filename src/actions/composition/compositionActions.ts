import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {clearAllLayers} from './actions/clear-all-layers';
import {tempoTap} from './actions/tempo-tap';
import {tempoResync} from './actions/tempo-resync';
import {compositionMasterChange} from './actions/composition-master-change';
import {compositionOpacityChange} from './actions/composition-opacity-change';
import {compositionVolumeChange} from './actions/composition-volume-change';
import {compositionSpeedChange} from './actions/composition-speed-change';

export function getCompositionActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	return {
		clearAll: clearAllLayers(restApi, websocketApi, oscApi),
		tempoTap: tempoTap(restApi, websocketApi, oscApi),
		resyncTap: tempoResync(restApi, websocketApi, oscApi),
		compositionMasterChange: compositionMasterChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionOpacityChange: compositionOpacityChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionVolumeChange: compositionVolumeChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionSpeedChange: compositionSpeedChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
	};
}
