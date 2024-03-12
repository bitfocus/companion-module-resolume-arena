import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Volume',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		subscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}