import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Volume',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	} as any;
}