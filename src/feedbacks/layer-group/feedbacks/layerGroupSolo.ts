import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupSolo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Solo',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}