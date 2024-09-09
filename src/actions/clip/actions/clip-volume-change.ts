import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getClipOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {parameterStates} from '../../../state';
import {ResolumeArenaModuleInstance} from '../../../index';
import {ClipUtils} from '../../../domain/clip/clip-utils';

export function clipVolumeChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	clipUtils: () => ClipUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Clip Volume Change',
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
				label: 'Value in db (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theClipUtils = clipUtils();
			if (theApi && theClipUtils) {
				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value)));
				const layerInput = +await resolumeArenaInstance.parseVariablesInString(options.layer);
				const columnInput = +await resolumeArenaInstance.parseVariablesInString(options.column);
				const currentValue: number = parameterStates.get()['/composition/layers/' + layerInput + '/clips/' + columnInput + '/audio/volume']?.value;

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
					let paramId = layer?.audio!.volume!.id! + '';
					websocketApi()?.setParam(paramId, value);
				}
			}
		}
	};
}
