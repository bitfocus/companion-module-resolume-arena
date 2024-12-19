import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {bypassLayerGroup} from './actions/bypass-layer-group';
import {clearLayerGroup} from './actions/clear-layer-group';
import {layerGroupNextCol} from './actions/layer-group-next-col';
import {layerGroupPrevCol} from './actions/layer-group-prev-col';
import {selectLayerGroup} from './actions/select-layer-group';
import {soloLayerGroup} from './actions/solo-layer-group';
import {connectLayerGroupColumn} from './actions/connect-layer-group-column';
import {layerGroupMasterChange} from './actions/layer-group-master-change';
import {layerGroupVolumeChange} from './actions/layer-group-volume-change';
import {layerGroupOpacityChange} from './actions/layer-group-opacity-change';
import {layerGroupSpeedChange} from './actions/layer-group-speed-change';
import {selectLayerGroupColumn} from './actions/select-layer-group-column';

export function getLayerGroupActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const layerGroupUtils = resolumeArenaModuleInstance.getLayerGroupUtils.bind(resolumeArenaModuleInstance);
	return {
		bypassLayerGroup: bypassLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		clearLayerGroup: clearLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		grpNextCol: layerGroupNextCol(restApi, oscApi, resolumeArenaModuleInstance),
		grpPrevCol: layerGroupPrevCol(restApi, oscApi, resolumeArenaModuleInstance),
		selectLayerGroup: selectLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		soloLayerGroup: soloLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		connectLayerGroupColumn: connectLayerGroupColumn(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		selectLayerGroupColumn: selectLayerGroupColumn(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		layerGroupMasterChange: layerGroupMasterChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		layerGroupOpacityChange: layerGroupOpacityChange(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		layerGroupVolumeChange: layerGroupVolumeChange(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		layerGroupSpeedChange: layerGroupSpeedChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance)
	};
}
