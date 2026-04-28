import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Opacity',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	} as any;
}