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

export function getActions(ResolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	var restApi = ResolumeArenaModuleInstance.getRestApi.bind(ResolumeArenaModuleInstance);
	var websocketApi = ResolumeArenaModuleInstance.getWebsocketApi.bind(ResolumeArenaModuleInstance);
	var oscApi = ResolumeArenaModuleInstance.getOscApi.bind(ResolumeArenaModuleInstance);
	var clipUtils = ResolumeArenaModuleInstance.getClipUtils.bind(ResolumeArenaModuleInstance);
	var layerUtils = ResolumeArenaModuleInstance.getLayerUtils.bind(ResolumeArenaModuleInstance);
	var deckUtils = ResolumeArenaModuleInstance.getDeckUtils.bind(ResolumeArenaModuleInstance);
	var actions: CompanionActionDefinitions = {
		bypassLayer: bypassLayer(restApi, oscApi),
		bypassLayerGroup: bypassLayerGroup(restApi, oscApi),
		clearAll: clearAllLayers(restApi, oscApi),
		clearLayer: clearLayer(restApi, oscApi),
		clearLayerGroup: clearLayerGroup(oscApi),
		compNextCol: compNextCol(restApi, oscApi),
		compPrevCol: compPrevCol(restApi, oscApi),
		custom: customOscCommand(oscApi, ResolumeArenaModuleInstance),
		grpNextCol: layerGroupNextCol(restApi, oscApi),
		grpPrevCol: layerGroupPrevCol(restApi, oscApi),
		layNextCol: layerNextCol(restApi, oscApi),
		layPrevCol: layerPrevCol(restApi, oscApi),
		selectClip: selectClip(restApi, oscApi),
		selectLayer: selectLayer(restApi, oscApi),
		selectLayerGroup: selectLayerGroup(restApi, oscApi),
		soloLayer: soloLayer(restApi, oscApi),
		soloLayerGroup: soloLayerGroup(restApi, oscApi),
		tempoTap: tempoTap(restApi, oscApi),
		triggerClip: connectClip(restApi, oscApi),
		clipSpeedChange: clipSpeedChange(restApi, websocketApi, oscApi, clipUtils, ResolumeArenaModuleInstance),
		triggerColumn: triggerColumn(restApi, oscApi),
		triggerLayerGroupColumn: triggerLayerGroupColumn(restApi, oscApi),
		layerOpacityChange: layerOpacityChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		layerTransitionDurationChange: layerTransitionDurationChange(restApi, websocketApi, oscApi, layerUtils, ResolumeArenaModuleInstance),
		layerGroupOpacityChange: layerGroupOpacityChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		// TODO #46 feature request resolume layerGroupSpeedChange: layerGroupSpeedChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		compositionOpacityChange: compositionOpacityChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		compositionSpeedChange: compositionSpeedChange(restApi, websocketApi, oscApi, ResolumeArenaModuleInstance),
		selectDeck: selectDeck(restApi, websocketApi, oscApi, deckUtils),
	};
	return actions;
}
