import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {parameterStates} from '../../../state.js';
import {WebsocketInstance} from '../../../websocket.js';
import {getSpeedValue} from '../../../defaults.js';

export function compositionSpeedChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Composition Speed Change',
		options: [
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
				label: 'Value in percentage (e.g. 100 or 10)',
				useVariables: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theOscApi = oscApi();
			const inputValue: number = +(options.value) / 100;
			if (theApi) {
				const currentValue: number = +parameterStates.get()['/composition/speed']?.value;
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
					websocketApi()?.setPath('/composition/speed', value);
				}
			} else {
				switch (options.action) {
					case 'set':
						theOscApi?.customOsc('/composition/speed', 'f', getSpeedValue(inputValue) + '', 'n');
						break;
					case 'add':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume');
						theOscApi?.customOsc('/composition/speed', 'f', inputValue + '', '+');
						break;
					case 'subtract':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume');
						theOscApi?.customOsc('/composition/speed', 'f', inputValue + '', '-');
						break;
					default:
						break;
				}
			}
		},
	};
}
