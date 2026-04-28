import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {bypassLayerGroup} from '../layer-group/actions/bypass-layer-group.js';
import {bypassLayer} from './actions/bypass-layer.js';
import {clearLayer} from './actions/clear-layer.js';
import {selectLayer} from './actions/select-layer.js';
import {soloLayer} from './actions/solo-layer.js';
import {layerMasterChange} from './actions/layer-master-change.js';
import {layerOpacityChange} from './actions/layer-opacity-change.js';
import {layerVolumeChange} from './actions/layer-volume-change.js';
import {layerTransitionDurationChange} from './actions/layer-transition-duration-change.js';
import {layerNextCol} from './actions/layer-next-col.js';
import {layerPrevCol} from './actions/layer-prev-col.js';

export function getLayerActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const layerUtils = resolumeArenaModuleInstance.getLayerUtils.bind(resolumeArenaModuleInstance);
	return {
		bypassLayerGroup: bypassLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		bypassLayer: bypassLayer(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		clearLayer: clearLayer(restApi, websocketApi, oscApi,resolumeArenaModuleInstance),
		selectLayer: selectLayer(restApi, websocketApi, oscApi,resolumeArenaModuleInstance),
		soloLayer: soloLayer(restApi, websocketApi, oscApi,resolumeArenaModuleInstance),
		layerNextCol: layerNextCol(restApi, oscApi,resolumeArenaModuleInstance),
		layerPrewCol: layerPrevCol(restApi, oscApi,resolumeArenaModuleInstance),
		layerMasterChange: layerMasterChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		layerOpacityChange: layerOpacityChange(restApi, websocketApi, oscApi, layerUtils, resolumeArenaModuleInstance),
		layerVolumeChange: layerVolumeChange(restApi, websocketApi, oscApi, layerUtils, resolumeArenaModuleInstance),
		layerTransitionDurationChange: layerTransitionDurationChange(restApi, websocketApi, oscApi, layerUtils, resolumeArenaModuleInstance),
	};
}
