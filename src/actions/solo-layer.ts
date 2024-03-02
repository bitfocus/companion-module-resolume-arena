import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerOption} from '../defaults';
import {parameterStates} from '../state';
import {WebsocketInstance} from '../websocket';

export function soloLayer(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null
): CompanionActionDefinition {
	return {
		name: 'Solo Layer',
		options: [
			...getLayerOption(),
			{
				id: 'solo',
				type: 'dropdown',
				choices: [
					{
						id: 'on',
						label: 'On',
					},
					{
						id: 'off',
						label: 'Off',
					},
					{
						id: 'toggle',
						label: 'Toggle',
					},
				],
				default: 'toggle',
				label: 'Solo',
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let thewebsocketApi = websocketApi();
			if (theApi) {
				let solo;
				if (options.solo == 'toggle') {
					solo = !parameterStates.get()['/composition/layers/' + options.layer + '/solo']?.value;
				} else {
					solo = options.solo == 'on';
				}
				thewebsocketApi?.setPath('/composition/layers/' + options.layer + '/solo', solo);
			}
		},
	};
}
