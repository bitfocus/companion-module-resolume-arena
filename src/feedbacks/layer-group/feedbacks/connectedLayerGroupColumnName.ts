import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Connected Layer Group Column Name',
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnConnectedNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}
