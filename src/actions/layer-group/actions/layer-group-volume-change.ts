import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerGroupOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {parameterStates} from '../../../state';
import {ResolumeArenaModuleInstance} from '../../../index';
import {LayerGroupUtils} from '../../../domain/layer-groups/layer-group-util';

export function layerGroupVolumeChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	layerGroupUtils: () => LayerGroupUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Group Volume Change',
		options: [
			...getLayerGroupOption(),
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
			let theLayerGroupUtils = layerGroupUtils();
			if (theApi && theLayerGroupUtils) {
				const layer = options.layerGroup;
				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value)));
				const currentValue: number = +parameterStates.get()['/composition/groups/' + layer + '/audio/volume']?.value;

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
					const layer = theLayerGroupUtils.getLayerGroupFromCompositionState(options.layerGroup);
					let paramId = layer?.audio!.volume!.id! + '';
					websocketApi()?.setParam(paramId, value);
				}
			}
		}
	};
}
