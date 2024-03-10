import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function compositionMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Master',
		options: [],
		callback: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
		subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
		unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!)
	};
}