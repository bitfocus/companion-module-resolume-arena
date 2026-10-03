import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Opacity',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		}),
	};
}