import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleGreen, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getLayerOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerSelectedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		}),
	};
}