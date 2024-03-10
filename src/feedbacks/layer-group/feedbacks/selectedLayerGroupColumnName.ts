import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function selectedLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Selected Layer Group Column Name',
		options: [...getLayerGroupOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}