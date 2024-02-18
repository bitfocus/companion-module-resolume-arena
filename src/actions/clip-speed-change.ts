import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '..';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getColumnOption, getLayerOption} from '../defaults';
import {parameterStates} from '../state';
import {WebsocketInstance} from '../websocket';
import {ClipUtils} from '../domain/clip/clip-utils';

export function clipSpeedChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clip Speed Change',
		options: [
			...getLayerOption(),
			...getColumnOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+',
					},
					{
						id: 'subtract',
						label: '-',
					},
					{
						id: 'set',
						label: '=',
					},
				],
				default: 'add',
				label: 'Action',
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value',
				useVariables: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theClipUtils = clipUtils();
			if (theApi && theClipUtils) {
                const clip = theClipUtils.getClipFromCompositionState(options.layer, options.column);
                const clipSpeedId = clip?.transport?.controls?.speed?.id +''
                
                const inputValue: number = +(await resolumeArenaInstance.parseVariablesInString(options.value));
                const currentValue: number = parameterStates.get()['/composition/layers/' + options.layer + '/clips/' + options.column + '/transport/position/behaviour/speed']?.value;

				let value: number | undefined;
				switch (options.action) {
					case 'set':
						value = inputValue;
						break;
					case 'add':
						value = currentValue + inputValue;
						break;
					case 'subtract':
						value = currentValue - inputValue;
						break;
					default:
						break;
				}
				if (value != undefined) {
					websocketApi()?.setParam(clipSpeedId, value);
				}
			}
		},
	};
}
