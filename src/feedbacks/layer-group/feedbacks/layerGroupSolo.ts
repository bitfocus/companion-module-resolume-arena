import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleGreen, getLayerGroupOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerGroupSolo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Group Solo',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerGroupOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackCallback.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			subscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackSubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerGroupUtils()!.layerGroupSoloFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerGroupUtils()!),
		}),
	};
}