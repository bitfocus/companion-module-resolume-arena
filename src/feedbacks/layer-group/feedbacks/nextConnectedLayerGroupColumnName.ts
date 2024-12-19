import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextConnectedLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Next Connected Layer Group Column Name',
		options: [...getLayerGroupOption(), {
			id: 'next',
			type: 'number',
			label: 'Next',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnNextConnectedNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}
