import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';
import {LayerUtils} from '../../../domain/layers/layer-util';

export function layerTransitionDurationChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	layerUtils: () => LayerUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Transition Duration Change',
		options: [
			...getLayerOption(),
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
				label: 'Value in seconds (e.g. 1 or 0.1)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theLayerUtils = layerUtils();
			if (theApi && theLayerUtils) {
				const layer = +await resolumeArenaInstance.parseVariablesInString(options.layer);
				const layerFromState = theLayerUtils.getLayerFromCompositionState(layer);
				const layerTransitionDurationId = layerFromState?.transition?.duration?.id + '';

				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value)));
				const currentValue: number | undefined = (await resolumeArenaInstance.restApi!.Layers.getSettings(layer)).transition?.duration?.value;

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
						websocketApi()?.subscribeParam(+layerTransitionDurationId);
						websocketApi()?.setParam(layerTransitionDurationId, value);
					}
				}
			}
		}
	};
}
