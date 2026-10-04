import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerGroupMaster(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Layer Group Master',
		affectedProperties: ['text', 'imageBuffer'],
		options: [...getLayerGroupOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupMasterFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupMasterFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupMasterFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		}),
	};
}