import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Master',
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupMasterFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),		unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}