import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function previousLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Previous Layer Group Column Name',
		options: [...getLayerGroupOption(), {
			id: 'previous',
			type: 'number',
			label: 'Previous',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}