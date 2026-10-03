import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Volume',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		}),
	};
}