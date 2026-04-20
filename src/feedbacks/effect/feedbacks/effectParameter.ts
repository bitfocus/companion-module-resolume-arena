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
				id: '_hint_collection',
				type: 'static-text',
				label: '',
				value: 'Collection: "params" covers most effect controls. Use "mixer" for mix/blend parameters, "effect" for effect-level flags.',
			},
			{
				id: 'collection',
				type: 'dropdown',
				label: 'Collection',
				choices: [
					{id: 'params', label: 'params — effect controls (most common)'},
					{id: 'mixer', label: 'mixer — mix/blend parameters'},
					{id: 'effect', label: 'effect — effect-level flags'},
				],
				default: 'params',
			},
			...buildParamNameOptions(eu),
		],
		callback: eu.effectParameterFeedbackCallback.bind(eu, scope),
		subscribe: eu.effectParameterFeedbackSubscribe.bind(eu, scope),
		unsubscribe: eu.effectParameterFeedbackUnsubscribe.bind(eu, scope),
	};
}
