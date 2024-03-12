import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupSolo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Solo',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}