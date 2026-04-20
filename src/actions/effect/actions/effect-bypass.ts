import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import {parameterStates} from '../../../state';
import {buildEffectScopeOptions, buildEffectChoiceOptions} from '../effect-action-options';

export function effectBypass(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinition {
	const eu = resolumeArenaInstance.getEffectUtils();
	return {
		name: 'Bypass Effect',
		options: [
			...buildEffectChoiceOptions(eu),
			...buildEffectScopeOptions(),
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
			const {scope, location, effectIdx} = await eu.parseScopeOptionsFromAction(options, resolumeArenaInstance);
			if (!effectIdx) return;
			const path = eu.effectBypassPath(scope, location, effectIdx);
			let bypassed: boolean;
			if (options.bypass === 'toggle') {
				bypassed = !parameterStates.get()[path]?.value;
			} else {
				bypassed = options.bypass === 'on';
			}
			ws.setPath(path, bypassed);
			parameterStates.update((state) => {
				state[path] = {value: bypassed} as any;
			});
			resolumeArenaInstance.checkFeedbacks('effectBypassed');
		},
	};
}
