import {CompanionFeedbackDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions, buildParamNameOptions} from '../../../actions/effect/effect-action-options';

const SCOPE_LABELS: Record<EffectScope, string> = {
	layer: 'Layer',
	clip: 'Clip',
	layergroup: 'Layer Group',
	composition: 'Composition',
};

export function effectParameter(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope, withClipList = false): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	const nameSuffix = withClipList ? ' — from list' : '';
	return {
		type: 'advanced',
		name: `Effect Parameter Value (${SCOPE_LABELS[scope]}${nameSuffix})`,
		options: [
			...buildScopedEffectOptions(eu, scope, withClipList),
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
			...buildParamNameOptions(eu, scope),
		],
		callback: eu.effectParameterFeedbackCallback.bind(eu, scope),
		subscribe: eu.effectParameterFeedbackSubscribe.bind(eu, scope),
		unsubscribe: eu.effectParameterFeedbackUnsubscribe.bind(eu, scope),
	};
}
