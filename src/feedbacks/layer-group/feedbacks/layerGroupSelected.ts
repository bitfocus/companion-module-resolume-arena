import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}