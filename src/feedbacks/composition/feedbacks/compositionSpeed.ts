import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function compositionSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Speed',
		affectedProperties: ['text', 'imageBuffer'],
		options: [],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!),
			subscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
			unsubscribe: resolumeArenaInstance.getCompositionUtils()!.compositionSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getCompositionUtils()!),
		}),
	};
}