import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Opacity',
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}