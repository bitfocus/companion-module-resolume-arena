import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getDefaultStyleRed} from '../../../defaults.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {EffectScope} from '../../../domain/effects/effect-utils.js';
import {buildScopedEffectOptions} from '../../../actions/effect/effect-action-options.js';

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
		// API 2.0: subscribe is removed; subscribe-side work is folded into
		// the callback (see effect-utils.ts::effectBypassedFeedbackCallback).
		callback: eu.effectBypassedFeedbackCallback.bind(eu, scope),
		unsubscribe: eu.effectBypassedFeedbackUnsubscribe.bind(eu, scope),
	};
}
