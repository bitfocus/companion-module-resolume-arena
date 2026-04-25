import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {EffectScope} from '../../../domain/effects/effect-utils.js';
import {parameterStates} from '../../../state.js';
import {buildScopedEffectOptions} from '../effect-action-options.js';

const SCOPE_LABELS: Record<EffectScope, string> = {
	layer: 'Layer',
	clip: 'Clip',
	layergroup: 'Layer Group',
	composition: 'Composition',
};

export function effectBypass(resolumeArenaInstance: ResolumeArenaModuleInstance, scope: EffectScope, withClipList = false): CompanionActionDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	const nameSuffix = withClipList ? ' — from list' : '';
	return {
		name: `Bypass Effect (${SCOPE_LABELS[scope]}${nameSuffix})`,
		options: [
			...buildScopedEffectOptions(eu, scope, withClipList),
			{
				id: 'bypass',
				type: 'dropdown',
				label: 'Bypass',
				choices: [
					{id: 'on', label: 'On'},
					{id: 'off', label: 'Off'},
					{id: 'toggle', label: 'Toggle'},
				],
				default: 'toggle',
			},
		],
		callback: async ({options}) => {
			const ws = resolumeArenaInstance.getWebsocketApi();
			if (!ws) return;
			const resolved = eu.parseScopeOptionsFromAction({...options, scope}, resolumeArenaInstance);
			if (!resolved.effectIdx) return;
			const {key, paramId, path} = eu.resolveBypassKey(resolved.scope, resolved.location, resolved.effectIdx);
			const bypassed = options.bypass === 'toggle' ? !parameterStates.get()[key]?.value : options.bypass === 'on';
			if (paramId !== undefined) {
				ws.setParam(String(paramId), bypassed);
			} else {
				ws.setPath(path, bypassed);
			}
			parameterStates.update((state) => {
				state[key] = {value: bypassed} as any;
			});
			eu.checkAllBypassFeedbacks();
		},
	};
}
