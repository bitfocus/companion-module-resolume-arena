import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {bypassLayer} from './actions/bypass-layer';
import {bypassLayerGroup} from './actions/bypass-layer-group';
import {clearAllLayers} from './actions/clear-all-layers';
import {clearLayer} from './actions/clear-layer';
import {clearLayerGroup} from './actions/clear-layer-group';
import {clipSpeedChange} from './actions/clip-speed-change';
import {compNextCol} from './actions/comp-next-col';
import {compPrevCol} from './actions/comp-prev-col';
import {compositionOpacityChange} from './actions/composition-opacity-change';
import {compositionSpeedChange} from './actions/composition-speed-change';
import {connectClip} from './actions/connect-clip';
import {customOscCommand} from './actions/custom-osc';
import {layerGroupNextCol} from './actions/layer-group-next-col';
import {layerGroupOpacityChange} from './actions/layer-group-opacity-change';
import {layerGroupPrevCol} from './actions/layer-group-prev-col';
import {layerNextCol} from './actions/layer-next-col';
import {layerOpacityChange} from './actions/layer-opacity-change';
import {layerPrevCol} from './actions/layer-prev-col';
import {layerTransitionDurationChange} from './actions/layer-transition-duration-change';
import {selectClip} from './actions/select-clip';
import {selectDeck} from './actions/select-deck';
import {selectLayer} from './actions/select-layer';
import {selectLayerGroup} from './actions/select-layer-group';
import {soloLayer} from './actions/solo-layer';
import {soloLayerGroup} from './actions/solo-layer-group';
import {tempoTap} from './actions/tempo-tap';
import {triggerColumn} from './actions/trigger-column';
import {triggerLayerGroupColumn} from './actions/trigger-layer-group-column';
import {tempoResync} from './actions/tempo-resync';

export function getActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	var restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	var websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	var oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	var clipUtils = resolumeArenaModuleInstance.getClipUtils.bind(resolumeArenaModuleInstance);
	var layerUtils = resolumeArenaModuleInstance.getLayerUtils.bind(resolumeArenaModuleInstance);
	var layerGroupUtils = resolumeArenaModuleInstance.getLayerGroupUtils.bind(resolumeArenaModuleInstance);
	var deckUtils = resolumeArenaModuleInstance.getDeckUtils.bind(resolumeArenaModuleInstance);
	var columnUtils = resolumeArenaModuleInstance.getColumnUtils.bind(resolumeArenaModuleInstance);
	var actions: CompanionActionDefinitions = {
		bypassLayerGroup: bypassLayerGroup(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		bypassLayer: bypassLayer(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		clearAll: clearAllLayers(restApi, websocketApi, oscApi),
		clearLayer: clearLayer(restApi, websocketApi, oscApi),
		clearLayerGroup: clearLayerGroup(restApi, websocketApi, oscApi),
		compNextCol: compNextCol(restApi, oscApi),
		compPrevCol: compPrevCol(restApi, oscApi),
		custom: customOscCommand(oscApi, resolumeArenaModuleInstance),
		grpNextCol: layerGroupNextCol(restApi, oscApi),
		grpPrevCol: layerGroupPrevCol(restApi, oscApi),
		layNextCol: layerNextCol(restApi, oscApi),
		layPrevCol: layerPrevCol(restApi, oscApi),
		selectClip: selectClip(restApi, websocketApi, oscApi),
		selectLayer: selectLayer(restApi, websocketApi, oscApi),
		selectLayerGroup: selectLayerGroup(restApi, websocketApi, oscApi),
		soloLayer: soloLayer(restApi, websocketApi, oscApi),
		soloLayerGroup: soloLayerGroup(restApi, websocketApi, oscApi),
		tempoTap: tempoTap(restApi, websocketApi, oscApi),
		resyncTap: tempoResync(restApi, websocketApi, oscApi),
		triggerClip: connectClip(restApi, websocketApi, oscApi),
		clipSpeedChange: clipSpeedChange(restApi, websocketApi, oscApi, clipUtils, resolumeArenaModuleInstance),
		triggerColumn: triggerColumn(restApi, websocketApi, oscApi, columnUtils),
		triggerLayerGroupColumn: triggerLayerGroupColumn(restApi, websocketApi, oscApi, layerGroupUtils),
		layerOpacityChange: layerOpacityChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		layerTransitionDurationChange: layerTransitionDurationChange(restApi, websocketApi, oscApi, layerUtils, resolumeArenaModuleInstance),
		layerGroupOpacityChange: layerGroupOpacityChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		// TODO #46 feature request resolume layerGroupSpeedChange: layerGroupSpeedChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		compositionOpacityChange: compositionOpacityChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		compositionSpeedChange: compositionSpeedChange(restApi, websocketApi, oscApi, resolumeArenaModuleInstance),
		selectDeck: selectDeck(restApi, websocketApi, oscApi, deckUtils),
	};
	return actions;
}
