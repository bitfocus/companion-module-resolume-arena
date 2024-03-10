import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleBlue, getLayerOption} from '../../../defaults';
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