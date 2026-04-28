import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getClipOption, getSpeedValue} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ClipUtils} from '../../../domain/clip/clip-utils.js';
import {ClipId} from '../../../domain/clip/clip-id.js';
import {parameterStates} from '../../../state.js';

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
			...getClipOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+ (not in OSC)'
					},
					{
						id: 'subtract',
						label: '- (not in OSC)'
					},
					{
						id: 'set',
						label: '='
					}
				],
				default: 'add',
				label: 'Action'
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value in percentage (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			const theApi = restApi();
			const theOscApi = oscApi();
			const theClipUtils = clipUtils();
			const inputValue: number = (+(options.value)) / 100;
			const layer = +(options.layer);
			const column = +(options.column);

			if (theApi && theClipUtils) {
				const clip = theClipUtils.getClipFromCompositionState(layer, column);
				const id = clip?.transport?.controls?.speed?.id;
				if (id === undefined) {
					resolumeArenaInstance.log('warn', 'clipSpeedChange: paramId should not be undefined');
					return;
				}

				let value: number | undefined;
				if (options.action === 'set') {
					value = inputValue;
				} else {
					const cached = parameterStates.get()[`/parameter/by-id/${id}`]?.value;
					const currentValue = cached !== undefined
						? +cached
						: (await theApi.Clips.getStatus(new ClipId(layer, column))).transport?.controls?.speed?.value;
					if (currentValue === undefined) return;
					value = options.action === 'add' ? currentValue + inputValue : currentValue - inputValue;
				}

				if (value !== undefined) {
					await websocketApi()?.subscribeParam(id);
					await websocketApi()?.setParam(String(id), value);
				}
			} else {
				switch (options.action) {
					case 'set':
						theOscApi?.customOsc(
							'/composition/layers/' + layer + '/clips/' + column + '/transport/position/behaviour/speed',
							'f',
							getSpeedValue(inputValue) + '',
							'n'
						);
						break;
					case 'add':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume');
						theOscApi?.customOsc(
							'/composition/layers/' + layer + '/clips/' + column + '/transport/position/behaviour/speed',
							'f',
							inputValue + '',
							'+'
						);
						break;
					case 'subtract':
						resolumeArenaInstance.log('warn', 'relative osc commands have a bug in resolume');
						theOscApi?.customOsc(
							'/composition/layers/' + layer + '/clips/' + column + '/transport/position/behaviour/speed',
							'f',
							inputValue + '',
							'-'
						);
						break;
					default:
						break;
				}
			}
		}
	};
}
