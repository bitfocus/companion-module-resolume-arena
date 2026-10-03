import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function previousConnectedLayerGroupColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Previous Connected Layer Group Column Name',
		options: [...getLayerGroupOption(), {
			id: 'previous',
			type: 'number',
			label: 'Previous',
			default: 1,
			min: 1,
			max: 65535
		}],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnPreviousConnectedNameFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}
