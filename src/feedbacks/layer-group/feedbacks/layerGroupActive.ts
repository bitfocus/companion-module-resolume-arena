import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleBlue, getLayerGroupOption} from '../../../defaults';
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