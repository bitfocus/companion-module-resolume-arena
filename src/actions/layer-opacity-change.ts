import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerOption} from '../defaults';
import {WebsocketInstance} from '../websocket';
import {parameterStates} from '../state';
import { ResolumeArenaModuleInstance } from '..';

export function layerOpacityChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Opacity Change',
		options: [
			...getLayerOption(),
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
			if (theApi) {
				const layer = options.layer;
				const inputValue: number = +await resolumeArenaInstance.parseVariablesInString(options.value);
				const currentValue: number = +parameterStates.get()['/composition/layers/' + layer + '/master']?.value;

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
					websocketApi()?.setPath('/composition/layers/' + options.layer + '/master', value);
				}
			}
		},
	};
}
