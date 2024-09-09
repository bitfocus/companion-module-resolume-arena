import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerGroupOption} from '../../../defaults';
import {parameterStates} from '../../../state';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';

export function soloLayerGroup(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	_oscApi: () => (ArenaOscApi | null), resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Solo Layer Group',
		options: [
			...getLayerGroupOption(),
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
				const layerGroup = +await resolumeArenaModuleInstance.parseVariablesInString(options.layer);
				if (options.solo == 'toggle') {
					solo = !parameterStates.get()['/composition/groups/' + layerGroup + '/solo']?.value;
				} else {
					solo = options.solo == 'on';
				}
				thewebsocketApi?.setPath('/composition/layergroups/' + layerGroup + '/solo', solo);
			}
		},
	};
}
