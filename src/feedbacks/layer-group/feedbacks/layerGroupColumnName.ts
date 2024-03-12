import {ResolumeArenaModuleInstance} from '../../../index';
import {getColumnOption, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Column Name',
		options: [...getLayerGroupOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}