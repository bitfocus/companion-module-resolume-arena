import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function compositionSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Speed',
		options: [],
		callback: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
		subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
		unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!)
	};
}