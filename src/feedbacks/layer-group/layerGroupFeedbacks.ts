import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {layerGroupBypassed} from './feedbacks/layerGroupBypassed.js';
import {layerGroupSolo} from './feedbacks/layerGroupSolo.js';
import {layerGroupActive} from './feedbacks/layerGroupActive.js';
import {layerGroupSelected} from './feedbacks/layerGroupSelected.js';
import {layerGroupMaster} from './feedbacks/layerGroupMaster.js';
import {layerGroupOpacity} from './feedbacks/layerGroupOpacity.js';
import {layerGroupVolume} from './feedbacks/layerGroupVolume.js';
import {layerGroupColumnsSelected} from './feedbacks/layerGroupColumnsSelected.js';
import {layerGroupColumnName} from './feedbacks/layerGroupColumnName.js';
import {selectedLayerGroupColumnName} from './feedbacks/selectedLayerGroupColumnName.js';
import {nextSelectedLayerGroupColumnName} from './feedbacks/nextSelectedLayerGroupColumnName.js';
import {previousSelectedLayerGroupColumnName} from './feedbacks/previousSelectedLayerGroupColumnName.js';
import {layerGroupSpeed} from './feedbacks/layerGroupSpeed.js';
import {layerGroupColumnsConnected} from './feedbacks/layerGroupColumnsConnected.js';
import {nextConnectedLayerGroupColumnName} from './feedbacks/nextConnectedLayerGroupColumnName.js';
import {previousConnectedLayerGroupColumnName} from './feedbacks/previousConnectedLayerGroupColumnName.js';
import {connectedLayerGroupColumnName} from './feedbacks/connectedLayerGroupColumnName.js';

export function getLayerGroupApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		layerGroupBypassed: layerGroupBypassed(resolumeArenaInstance),
		layerGroupSolo: layerGroupSolo(resolumeArenaInstance),
		layerGroupActive: layerGroupActive(resolumeArenaInstance),
		layerGroupSelected: layerGroupSelected(resolumeArenaInstance),
		layerGroupMaster: layerGroupMaster(resolumeArenaInstance),
		layerGroupOpacity: layerGroupOpacity(resolumeArenaInstance),
		layerGroupVolume: layerGroupVolume(resolumeArenaInstance),
		layerGroupSpeed: layerGroupSpeed(resolumeArenaInstance),
		layerGroupColumnsSelected: layerGroupColumnsSelected(resolumeArenaInstance),
		layerGroupColumnsConnected: layerGroupColumnsConnected(resolumeArenaInstance),
		layerGroupColumnName: layerGroupColumnName(resolumeArenaInstance),
		selectedLayerGroupColumnName: selectedLayerGroupColumnName(resolumeArenaInstance),
		connectedLayerGroupColumnName: connectedLayerGroupColumnName(resolumeArenaInstance),
		nextSelectedLayerGroupColumnName: nextSelectedLayerGroupColumnName(resolumeArenaInstance),
		nextConnectedLayerGroupColumnName: nextConnectedLayerGroupColumnName(resolumeArenaInstance),
		previousSelectedLayerGroupColumnName: previousSelectedLayerGroupColumnName(resolumeArenaInstance),
		previousConnectedLayerGroupColumnName: previousConnectedLayerGroupColumnName(resolumeArenaInstance),
	};
}
