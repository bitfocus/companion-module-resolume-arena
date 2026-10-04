import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function compositionMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Master',
		affectedProperties: ['text', 'imageBuffer'],
		options: [],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
			subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
			unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
		}),
	};
}