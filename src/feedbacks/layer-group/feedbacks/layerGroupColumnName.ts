import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getColumnOption, getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Column Name',
		options: [...getLayerGroupOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}