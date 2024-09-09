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
import {nextLayerGroupColumnName} from './feedbacks/nextLayerGroupColumnName';
import {previousLayerGroupColumnName} from './feedbacks/previousLayerGroupColumnName';
import {layerGroupSpeed} from './feedbacks/layerGroupSpeed';

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
		layerGroupColumnName: layerGroupColumnName(resolumeArenaInstance),
		selectedLayerGroupColumnName: selectedLayerGroupColumnName(resolumeArenaInstance),
		nextLayerGroupColumnName: nextLayerGroupColumnName(resolumeArenaInstance),
		previousLayerGroupColumnName: previousLayerGroupColumnName(resolumeArenaInstance),
	};
}
