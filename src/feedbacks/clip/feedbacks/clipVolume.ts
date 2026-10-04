import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getClipOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function clipVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Volume',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getClipOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
			subscribe: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
			unsubscribe: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		}),
	};
}