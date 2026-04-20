import {CompanionFeedbackDefinition, Regex} from '@companion-module/base';
import {getDefaultStyleRed, getLayerOption} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';

export function effectBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		type: 'boolean',
		name: 'Effect Bypassed',
		defaultStyle: getDefaultStyleRed(),
		options: [
			...getLayerOption(),
			{
				id: 'effectIdx',
				type: 'textinput',
				label: 'Effect (1-based index)',
				default: '1',
				useVariables: true,
				regex: Regex.NUMBER,
			},
		],
		callback: eu.effectBypassedFeedbackCallback.bind(eu),
		subscribe: eu.effectBypassedFeedbackSubscribe.bind(eu),
		unsubscribe: eu.effectBypassedFeedbackUnsubscribe.bind(eu),
	};
}
