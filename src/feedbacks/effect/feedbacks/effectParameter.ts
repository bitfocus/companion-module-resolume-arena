import {CompanionFeedbackDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {EffectScope} from '../../../domain/effects/effect-utils.js';
import {buildScopedEffectOptions, buildParamNameOptions} from '../../../actions/effect/effect-action-options.js';

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
			...buildParamNameOptions(eu),
		],
		// API 2.0: subscribe is removed; subscribe-side work folds into callback.
		callback: eu.effectParameterFeedbackCallback.bind(eu, scope),
		unsubscribe: eu.effectParameterFeedbackUnsubscribe.bind(eu, scope),
	};
}
