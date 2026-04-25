import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleGreen, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerSolo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Solo',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}