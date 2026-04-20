import {CompanionFeedbackDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions} from '../../../actions/effect/effect-action-options';

const SCOPE_LABELS: Record<EffectScope, string> = {
	layer: 'Layer',
	clip: 'Clip',
	layergroup: 'Layer Group',
	composition: 'Composition',
};

export function effectParameter(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		type: 'advanced',
		name: `Effect Parameter Value (${SCOPE_LABELS[scope]})`,
		options: [
			...buildScopedEffectOptions(eu, scope),
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
		callback: eu.effectParameterFeedbackCallback.bind(eu, scope),
		subscribe: eu.effectParameterFeedbackSubscribe.bind(eu, scope),
		unsubscribe: eu.effectParameterFeedbackUnsubscribe.bind(eu, scope),
	};
}
