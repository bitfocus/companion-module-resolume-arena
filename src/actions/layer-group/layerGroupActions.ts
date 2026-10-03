import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {bypassLayerGroup} from './actions/bypass-layer-group.js';
import {clearLayerGroup} from './actions/clear-layer-group.js';
import {layerGroupNextCol} from './actions/layer-group-next-col.js';
import {layerGroupPrevCol} from './actions/layer-group-prev-col.js';
import {selectLayerGroup} from './actions/select-layer-group.js';
import {soloLayerGroup} from './actions/solo-layer-group.js';
import {connectLayerGroupColumn} from './actions/connect-layer-group-column.js';
import {layerGroupMasterChange} from './actions/layer-group-master-change.js';
import {layerGroupVolumeChange} from './actions/layer-group-volume-change.js';
import {layerGroupOpacityChange} from './actions/layer-group-opacity-change.js';
import {layerGroupSpeedChange} from './actions/layer-group-speed-change.js';
import {selectLayerGroupColumn} from './actions/select-layer-group-column.js';

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
