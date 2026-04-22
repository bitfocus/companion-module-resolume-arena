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

export function effectBypassed(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope, withClipList = false): CompanionFeedbackDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	const nameSuffix = withClipList ? ' — from list' : '';
	return {
		type: 'boolean',
		name: `Effect Bypassed (${SCOPE_LABELS[scope]}${nameSuffix})`,
		defaultStyle: getDefaultStyleRed(),
		options: buildScopedEffectOptions(eu, scope, withClipList),
		callback: eu.effectBypassedFeedbackCallback.bind(eu, scope),
		subscribe: eu.effectBypassedFeedbackSubscribe.bind(eu, scope),
		unsubscribe: eu.effectBypassedFeedbackUnsubscribe.bind(eu, scope),
	};
}
