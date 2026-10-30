import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Master',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		}),
	};
}