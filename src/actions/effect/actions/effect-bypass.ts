import {CompanionActionDefinition, Regex} from '@companion-module/base';
import {getLayerOption} from '../../../defaults';
import {parameterStates} from '../../../state';
import {ResolumeArenaModuleInstance} from '../../../index';

export function effectBypass(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinition {
	return {
		name: 'Bypass Effect',
		options: [
			...getLayerOption(),
			{
				id: 'effectIdx',
				type: 'textinput',
				label: 'Effect (1-based index)',
				default: '1',
				useVariables: true,
				regex: Regex.NUMBER,
			},
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
			const layer = +await resolumeArenaInstance.parseVariablesInString(options.layer as string);
			const effectIdx = +await resolumeArenaInstance.parseVariablesInString(options.effectIdx as string);
			if (!layer || !effectIdx) return;
			const path = `/composition/layers/${layer}/video/effects/${effectIdx}/bypassed`;
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
