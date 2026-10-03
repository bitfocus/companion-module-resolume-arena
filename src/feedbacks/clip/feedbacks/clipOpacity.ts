import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getClipOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function clipOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Opacity',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getClipOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
			subscribe: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
			unsubscribe: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		}),
	};
}