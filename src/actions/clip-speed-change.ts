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
	oscApi: () => ArenaOscApi | null,
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
						label: '+ (not in OSC)',
					},
					{
						id: 'subtract',
						label: '- (not in OSC)',
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
			let theClipUtils = clipUtils();
			const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value)))/100;
			if (theApi && theClipUtils) {
                const clip = theClipUtils.getClipFromCompositionState(options.layer, options.column);
                const clipSpeedId = clip?.transport?.controls?.speed?.id +''
                const currentValue: number = parameterStates.get()['/composition/layers/' + options.layer + '/clips/' + options.column + '/transport/position/behaviour/speed']?.value;

				let value: number | undefined;
				switch (options.action) {
					case 'set':
						value = inputValue;
						break;
					case 'add':
						console.log('currentValue', currentValue)
						console.log('inputValue', inputValue)

						value = currentValue + inputValue;
						break;
					case 'subtract':
						value = currentValue - inputValue;
						break;
					default:
						break;
				}
				if (value != undefined) {
					console.log('setSpeed',value, currentValue)
					websocketApi()?.setParam(clipSpeedId, value);
				}
			}else{
				switch (options.action) {
					case 'set':
						theOscApi?.customOsc('/composition/layers/' + options.layer + '/clips/' + options.column + '/transport/position/behaviour/speed','f',inputValue+'','n')
						break;
					case 'add':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume')
						theOscApi?.customOsc('/composition/layers/' + options.layer + '/clips/' + options.column + '/transport/position/behaviour/speed','f',inputValue+'','+')
						break;
					case 'subtract':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume')
						theOscApi?.customOsc('/composition/layers/' + options.layer + '/clips/' + options.column + '/transport/position/behaviour/speed','f',inputValue+'','-')
						break;
					default:
						break;
				}
			}
		},
	};
}
