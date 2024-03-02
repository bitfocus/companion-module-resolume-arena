import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi, {OscArgs} from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerGroupOption} from '../defaults';
import {parameterStates} from '../state';
import {WebsocketInstance} from '../websocket';
import {ResolumeArenaModuleInstance} from '..';

export function bypassLayerGroup(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	oscApi: () => ArenaOscApi | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Bypass Layer Group',
		options: [
			...getLayerGroupOption(),
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
			const layerGroup = options.layerGroup as number;
			if (theApi) {
				let bypassed;
				if (options.bypass == 'toggle') {
					bypassed = !parameterStates.get()['/composition/groups/' + layerGroup + '/bypassed']?.value;
				} else {
					bypassed = options.bypass == 'on';
				}
				thewebsocketApi?.setPath(`/composition/layergroups/${layerGroup}/bypassed`, bypassed);
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
						resolumeArenaInstance.log('warn','bypassLayerGroup - toggle not supported in OSC')
						break;
					default:
						break;
				}
				if (bypassed !== undefined) {
					theOscApi?.bypassLayerGroup(layerGroup, bypassed ? OscArgs.One : OscArgs.Zero);
				}
			}
		},
	};
}
