import { CompanionActionDefinition } from '@companion-module/base';
import { ResolumeArenaModuleInstance } from '..';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import { parameterStates } from '../state';
import { WebsocketInstance } from '../websocket';

export function compositionMasterChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Composition Master Change',
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
			if (theApi) {
                const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value)))/100;
				const currentValue: number = +parameterStates.get()['/composition/master']?.value;
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
				if (value!=undefined) {
					websocketApi()?.setPath('/composition/master', value);
				}
			}
		},
	};
}
