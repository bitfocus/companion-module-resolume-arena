import {CompanionActionDefinition} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../../index';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption, getSpeedValue} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ClipUtils} from '../../../domain/clip/clip-utils';
import {ClipId} from '../../../domain/clip/clip-id';

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
			let theApi = restApi();
			let theOscApi = oscApi();
			let theClipUtils = clipUtils();
			const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value))) / 100;
			const layer = +await resolumeArenaInstance.parseVariablesInString(options.layer);
			const column = +await resolumeArenaInstance.parseVariablesInString(options.column);
			if (theApi && theClipUtils) {
				const clip = theClipUtils.getClipFromCompositionState(layer, column);
				const clipSpeedId = clip?.transport?.controls?.speed?.id + '';
				const currentValue: number | undefined = (await theApi!.Clips.getStatus(new ClipId(layer, column))).transport?.controls?.speed?.value;
				if (currentValue !== undefined) {
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
						websocketApi()?.subscribeParam(+clipSpeedId);
						websocketApi()?.setParam(clipSpeedId, value);
					}
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
