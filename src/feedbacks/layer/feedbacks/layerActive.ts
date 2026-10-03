import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleBlue, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerActive(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Active',
		defaultStyle: getDefaultStyleBlue(),
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerActiveFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}