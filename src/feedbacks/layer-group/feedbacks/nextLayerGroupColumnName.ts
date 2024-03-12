import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Next Layer Group Column Name',
		options: [...getLayerGroupOption(), {
			id: 'next',
			type: 'number',
			label: 'Next',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNextNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}