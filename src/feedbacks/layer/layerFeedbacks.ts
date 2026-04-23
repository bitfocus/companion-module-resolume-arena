import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {layerTransportPosition} from './feedbacks/layerTransportPosition.js';
import {layerBypassed} from './feedbacks/layerBypassed.js';
import {layerSolo} from './feedbacks/layerSolo.js';
import {layerActive} from './feedbacks/layerActive.js';
import {layerSelected} from './feedbacks/layerSelected.js';
import {layerMaster} from './feedbacks/layerMaster.js';
import {layerOpacity} from './feedbacks/layerOpacity.js';
import {layerVolume} from './feedbacks/layerVolume.js';
import {layerTransitionDuration} from './feedbacks/layerTransitionDuration.js';

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
