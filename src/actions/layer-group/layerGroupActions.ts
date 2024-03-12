import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {bypassLayerGroup} from './actions/bypass-layer-group';
import {clearLayerGroup} from './actions/clear-layer-group';
import {layerGroupNextCol} from './actions/layer-group-next-col';
import {layerGroupPrevCol} from './actions/layer-group-prev-col';
import {selectLayerGroup} from './actions/select-layer-group';
import {soloLayerGroup} from './actions/solo-layer-group';
import {triggerLayerGroupColumn} from './actions/trigger-layer-group-column';
import {layerGroupMasterChange} from './actions/layer-group-master-change';
import {layerGroupVolumeChange} from './actions/layer-group-volume-change';
import {layerGroupOpacityChange} from './actions/layer-group-opacity-change';

export function getLayerGroupActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const layerGroupUtils = resolumeArenaModuleInstance.getLayerGroupUtils.bind(resolumeArenaModuleInstance);
	return {
		bypassLayerGroup: bypassLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		clearLayerGroup: clearLayerGroup(restApi, websocketApi, oscApi),
		grpNextCol: layerGroupNextCol(restApi, oscApi),
		grpPrevCol: layerGroupPrevCol(restApi, oscApi),
		selectLayerGroup: selectLayerGroup(restApi, websocketApi, oscApi),
		soloLayerGroup: soloLayerGroup(restApi, websocketApi, oscApi),
		triggerLayerGroupColumn: triggerLayerGroupColumn(restApi, websocketApi, oscApi, layerGroupUtils),
		layerGroupMasterChange: layerGroupMasterChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		layerGroupOpacityChange: layerGroupOpacityChange(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		layerGroupVolumeChange: layerGroupVolumeChange(restApi, websocketApi, oscApi, layerGroupUtils, resolumeArenaModuleInstance),
		// TODO #46 feature request resolume layerGroupSpeedChange: layerGroupSpeedChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
	};
}
