import {ResolumeArenaModuleInstance} from '../../../index';
import {getColumnOption, getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupColumnsConnected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Column Connected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsConnectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}
