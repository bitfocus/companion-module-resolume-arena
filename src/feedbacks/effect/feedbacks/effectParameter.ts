import {CompanionFeedbackDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {buildEffectChoiceOptions, buildEffectScopeOptions} from '../../../actions/effect/effect-action-options';

export function effectParameter(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		type: 'advanced',
		name: 'Effect Parameter Value',
		options: [
			...buildEffectChoiceOptions(eu),
			...buildEffectScopeOptions(),
			{
				id: 'collection',
				type: 'dropdown',
				label: 'Collection',
				choices: [
					{id: 'params', label: 'params'},
					{id: 'mixer', label: 'mixer'},
					{id: 'effect', label: 'effect'},
				],
				default: 'params',
			},
			{
				id: 'paramName',
				type: 'textinput',
				label: 'Parameter name',
				default: '',
				useVariables: true,
			},
		],
		callback: eu.effectParameterFeedbackCallback.bind(eu),
		subscribe: eu.effectParameterFeedbackSubscribe.bind(eu),
		unsubscribe: eu.effectParameterFeedbackUnsubscribe.bind(eu),
	};
}
