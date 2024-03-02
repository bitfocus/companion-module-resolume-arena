import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi, {OscArgs} from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerOption} from '../defaults';
import {parameterStates} from '../state';
import {WebsocketInstance} from '../websocket';
import {ResolumeArenaModuleInstance} from '..';

export function bypassLayer(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Bypass Layer',
		options: [
			...getLayerOption(),
			{
				id: 'bypass',
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
				label: 'Bypass',
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theOscApi = oscApi();
			let thewebsocketApi = websocketApi();
			const layer = options.layer as number;
			if (theApi) {
				let bypassed;
				if (options.bypass == 'toggle') {
					bypassed = !parameterStates.get()['/composition/layers/' + layer + '/bypassed']?.value;
				} else {
					bypassed = options.bypass == 'on';
				}
				thewebsocketApi?.setPath(`/composition/layers/${layer}/bypassed`, bypassed);
			} else {
				let bypassed;
				switch (options.bypass) {
					case 'on':
						bypassed = true;
						break;
					case 'off':
						bypassed = false;
						break;
					case 'toggle':
						resolumeArenaInstance.log('warn', 'bypassLayer - toggle not supported in OSC');
						break;
					default:
						break;
				}
				if (bypassed !== undefined) {
					theOscApi?.bypassLayer(layer, bypassed ? OscArgs.One : OscArgs.Zero);
				}
			}
		},
	};
}
