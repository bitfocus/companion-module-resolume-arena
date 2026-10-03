import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getDefaultStyleRed, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {withSubscription} from '../../with-subscription.js';

export function layerBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Layer Bypassed',
		defaultStyle: getDefaultStyleRed(),
		options: [...getLayerOption()],
		...withSubscription(resolumeArenaInstance.getFeedbackSubscriptions(), {
			callback: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackCallback.bind(resolumeArenaInstance.getLayerUtils()!),
			subscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackSubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
			unsubscribe: resolumeArenaInstance.getLayerUtils()!.layerBypassedFeedbackUnsubscribe.bind(resolumeArenaInstance.getLayerUtils()!),
		}),
	};
}