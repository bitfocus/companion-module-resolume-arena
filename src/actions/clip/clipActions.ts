import {ResolumeArenaModuleInstance} from '../../index';
import {CompanionActionDefinitions} from '@companion-module/base';
import {selectClip} from './actions/select-clip';
import {connectClip} from './actions/connect-clip';
import {clipSpeedChange} from './actions/clip-speed-change';
import {clipOpacityChange} from './actions/clip-opacity-change';
import {clipVolumeChange} from './actions/clip-volume-change';

export function getClipActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const clipUtils = resolumeArenaModuleInstance.getClipUtils.bind(resolumeArenaModuleInstance);
	return {
		selectClip: selectClip(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		triggerClip: connectClip(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		clipSpeedChange: clipSpeedChange(restApi, websocketApi, oscApi, clipUtils, resolumeArenaModuleInstance),
		clipOpacityChange: clipOpacityChange(restApi, websocketApi, oscApi, clipUtils, resolumeArenaModuleInstance),
		clipVolumeChange: clipVolumeChange(restApi, websocketApi, oscApi, clipUtils, resolumeArenaModuleInstance),
	};
}
