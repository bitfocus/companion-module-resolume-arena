import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {parameterStates} from '../../../state.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {LayerGroupUtils} from '../../../domain/layer-groups/layer-group-util.js';

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
				const layerGroup = +(options.layer);
				const inputValue: number = (+(options.value));
				const currentValue: number = +parameterStates.get()['/composition/groups/' + layerGroup + '/audio/volume']?.value;

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
					const layer = theLayerGroupUtils.getLayerGroupFromCompositionState(layerGroup);
					const id = layer?.audio?.volume?.id;
					if (id !== undefined) {
						websocketApi()?.setParam(String(id), value);
					} else {
						resolumeArenaInstance.log('warn', 'layerGroupVolumeChange: paramId should not be undefined');
					}
				}
			}
		}
	};
}
