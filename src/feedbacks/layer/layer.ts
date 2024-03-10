import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {layerTransportPosition} from './feedbacks/layerTransportPosition';
import {layerBypassed} from './feedbacks/layerBypassed';
import {layerSolo} from './feedbacks/layerSolo';
import {layerActive} from './feedbacks/layerActive';
import {layerSelected} from './feedbacks/layerSelected';
import {layerMaster} from './feedbacks/layerMaster';
import {layerOpacity} from './feedbacks/layerOpacity';
import {layerVolume} from './feedbacks/layerVolume';
import {layerTransitionDuration} from './feedbacks/layerTransitionDuration';

export function getLayerApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		layerBypassed: layerBypassed(resolumeArenaInstance),
		layerSolo: layerSolo(resolumeArenaInstance),
		layerActive: layerActive(resolumeArenaInstance),
		layerSelected: layerSelected(resolumeArenaInstance),
		layerMaster: layerMaster(resolumeArenaInstance),
		layerOpacity: layerOpacity(resolumeArenaInstance),
		layerVolume: layerVolume(resolumeArenaInstance),
		layerTransitionDuration: layerTransitionDuration(resolumeArenaInstance),
		layerTransportPosition: layerTransportPosition(resolumeArenaInstance),
	};
}
