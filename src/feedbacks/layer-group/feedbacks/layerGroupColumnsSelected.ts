import {ResolumeArenaModuleInstance} from '../../../index';
import {getColumnOption, getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerGroupColumnsSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Column Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupColumnsSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!)
	};
}