import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Master',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),		subscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!)
	} as any;
}