import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Volume',
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}