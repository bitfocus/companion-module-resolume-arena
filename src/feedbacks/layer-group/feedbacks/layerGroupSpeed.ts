import {CompanionFeedbackDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {withSubscription} from '../../with-subscription.js';

export function layerGroupSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Speed',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerGroupOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		}),
	};
}
