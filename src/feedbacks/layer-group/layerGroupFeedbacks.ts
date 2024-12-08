import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {layerGroupBypassed} from './feedbacks/layerGroupBypassed';
import {layerGroupSolo} from './feedbacks/layerGroupSolo';
import {layerGroupActive} from './feedbacks/layerGroupActive';
import {layerGroupSelected} from './feedbacks/layerGroupSelected';
import {layerGroupMaster} from './feedbacks/layerGroupMaster';
import {layerGroupOpacity} from './feedbacks/layerGroupOpacity';
import {layerGroupVolume} from './feedbacks/layerGroupVolume';
import {layerGroupColumnsSelected} from './feedbacks/layerGroupColumnsSelected';
import {layerGroupColumnName} from './feedbacks/layerGroupColumnName';
import {selectedLayerGroupColumnName} from './feedbacks/selectedLayerGroupColumnName';
import {nextSelectedLayerGroupColumnName} from './feedbacks/nextSelectedLayerGroupColumnName';
import {previousSelectedLayerGroupColumnName} from './feedbacks/previousSelectedLayerGroupColumnName';
import {layerGroupSpeed} from './feedbacks/layerGroupSpeed';
import {layerGroupColumnsConnected} from './feedbacks/layerGroupColumnsConnected';
import {nextConnectedLayerGroupColumnName} from './feedbacks/nextConnectedLayerGroupColumnName';
import {previousConnectedLayerGroupColumnName} from './feedbacks/previousConnectedLayerGroupColumnName';
import {connectedLayerGroupColumnName} from './feedbacks/connectedLayerGroupColumnName';

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
