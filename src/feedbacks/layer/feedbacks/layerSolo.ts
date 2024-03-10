import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleGreen, getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerSolo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Solo',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		subscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}