import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Opacity',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		subscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}