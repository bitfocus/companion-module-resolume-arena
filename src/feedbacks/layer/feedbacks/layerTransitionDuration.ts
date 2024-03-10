import {ResolumeArenaModuleInstance} from '../../../index';
import {getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function layerTransitionDuration(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Transition Duration',
		options: [...getLayerOption()],
		callback: resolumeArenaInstance.getLayerUtils()!.layerTransitionDurationFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!)
	};
}