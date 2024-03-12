import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleRed, getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Bypassed',
		defaultStyle: getDefaultStyleRed(),
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		subscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}