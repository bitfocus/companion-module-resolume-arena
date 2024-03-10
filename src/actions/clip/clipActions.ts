import {ResolumeArenaModuleInstance} from '../../index';
import {CompanionActionDefinitions} from '@companion-module/base';
import {selectClip} from './actions/select-clip';
import {connectClip} from './actions/connect-clip';
import {clipSpeedChange} from './actions/clip-speed-change';

export function getClipActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const clipUtils = resolumeArenaModuleInstance.getClipUtils.bind(resolumeArenaModuleInstance);
	return {
		selectClip: selectClip(restApi, websocketApi, oscApi),
		triggerClip: connectClip(restApi, websocketApi, oscApi),
		clipSpeedChange: clipSpeedChange(restApi, websocketApi, oscApi, clipUtils, resolumeArenaModuleInstance)
	};
}
