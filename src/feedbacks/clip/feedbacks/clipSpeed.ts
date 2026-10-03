import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getColumnOption, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function clipSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Speed',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerOption(), ...getColumnOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
			subscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
			unsubscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		}),
	};
}