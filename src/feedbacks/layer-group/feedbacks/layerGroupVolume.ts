import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerGroupVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Volume',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerGroupOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		}),
	};
}