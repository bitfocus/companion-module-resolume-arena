import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function compositionOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Opacity',
		options: [],
		callback: resolumeArenaInstance.getCompositionUtils()!.compositionOpacityFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
	};
}