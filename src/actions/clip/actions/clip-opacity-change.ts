import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';
import {ClipUtils} from '../../../domain/clip/clip-utils';
import {ClipId} from '../../../domain/clip/clip-id';

export function clipOpacityChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clip Opacity Change',
		options: [
			...getClipOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+'
					},
					{
						id: 'subtract',
						label: '-'
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
			let theClipUtils = clipUtils();
			if (theApi && theClipUtils) {
				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value))) / 100;
				const layerInput = +await resolumeArenaInstance.parseVariablesInString(options.layer);
				const columnInput = +await resolumeArenaInstance.parseVariablesInString(options.column);
				const currentValue: number | undefined = (await theApi.Clips.getStatus(new ClipId(layerInput, columnInput))).video?.opacity.value;

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
						const layer = theClipUtils.getClipFromCompositionState(layerInput, columnInput);
						let paramId = layer?.video!.opacity!.id! + '';
						await websocketApi()?.subscribeParam(+paramId);
						await websocketApi()?.setParam(paramId, value);
					}
				}
			}
		}
	};
}
