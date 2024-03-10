import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleRed, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Bypassed',
		defaultStyle: getDefaultStyleRed(),
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}