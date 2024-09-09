import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerGroupOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {parameterStates} from '../../../state';
import {ResolumeArenaModuleInstance} from '../../../index';
import {LayerGroupUtils} from '../../../domain/layer-groups/layer-group-util';

export function layerGroupOpacityChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	layerGroupUtils: () => LayerGroupUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Group Opacity Change',
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
				label: 'Value in percentage (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theLayerGroupUtils = layerGroupUtils();
			if (theApi && theLayerGroupUtils) {
				const layerGroupInput = +await resolumeArenaInstance.parseVariablesInString(options.layer);
				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value))) / 100;
				const currentValue: number = +parameterStates.get()['/composition/groups/' + layerGroupInput + '/video/opacity']?.value;

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
					const layerGroup = theLayerGroupUtils.getLayerGroupFromCompositionState(layerGroupInput);
					let paramId = layerGroup?.video!.opacity!.id! + '';
					websocketApi()?.setParam(paramId, value);
				}
			}
		}
	};
}
