import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getDefaultStyleRed} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';
import {EffectScope} from '../../../domain/effects/effect-utils';
import {buildScopedEffectOptions} from '../../../actions/effect/effect-action-options';

const SCOPE_LABELS: Record<EffectScope, string> = {
	layer: 'Layer',
	clip: 'Clip',
	layergroup: 'Layer Group',
	composition: 'Composition',
};

export function effectBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		type: 'boolean',
		name: `Effect Bypassed (${SCOPE_LABELS[scope]})`,
		defaultStyle: getDefaultStyleRed(),
		options: buildScopedEffectOptions(eu, scope),
		callback: eu.effectBypassedFeedbackCallback.bind(eu, scope),
		subscribe: eu.effectBypassedFeedbackSubscribe.bind(eu, scope),
		unsubscribe: eu.effectBypassedFeedbackUnsubscribe.bind(eu, scope),
	};
}
