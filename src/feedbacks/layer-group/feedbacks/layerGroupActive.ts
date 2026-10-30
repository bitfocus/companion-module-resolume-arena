import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleBlue, getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupActive(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Active',
		defaultStyle: getDefaultStyleBlue(),
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}