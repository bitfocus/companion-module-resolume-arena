import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getDefaultStyleRed} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';
import {buildEffectChoiceOptions, buildEffectScopeOptions} from '../../../actions/effect/effect-action-options';

export function effectBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		type: 'boolean',
		name: 'Effect Bypassed',
		defaultStyle: getDefaultStyleRed(),
		options: [
			...buildEffectChoiceOptions(eu),
			...buildEffectScopeOptions(),
		],
		callback: eu.effectBypassedFeedbackCallback.bind(eu),
		subscribe: eu.effectBypassedFeedbackSubscribe.bind(eu),
		unsubscribe: eu.effectBypassedFeedbackUnsubscribe.bind(eu),
	};
}
