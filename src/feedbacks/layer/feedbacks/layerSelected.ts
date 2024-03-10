import {ResolumeArenaModuleInstance} from '../../../index';
import {getDefaultStyleGreen, getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
		subscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}