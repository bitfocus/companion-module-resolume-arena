import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {bypassLayerGroup} from '../layer-group/actions/bypass-layer-group';
import {bypassLayer} from './actions/bypass-layer';
import {clearLayer} from './actions/clear-layer';
import {selectLayer} from './actions/select-layer';
import {soloLayer} from './actions/solo-layer';
import {layerMasterChange} from './actions/layer-master-change';
import {layerOpacityChange} from './actions/layer-opacity-change';
import {layerVolumeChange} from './actions/layer-volume-change';
import {layerTransitionDurationChange} from './actions/layer-transition-duration-change';
import {layerNextCol} from './actions/layer-next-col';
import {layerPrevCol} from './actions/layer-prev-col';

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
