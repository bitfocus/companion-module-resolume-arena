import {ResolumeArenaModuleInstance} from '../../index.js';
import {CompanionActionDefinitions} from '@companion-module/base';
import {selectClip} from './actions/select-clip.js';
import {connectClip} from './actions/connect-clip.js';
import {clipSpeedChange} from './actions/clip-speed-change.js';
import {clipOpacityChange} from './actions/clip-opacity-change.js';
import {clipVolumeChange} from './actions/clip-volume-change.js';

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
