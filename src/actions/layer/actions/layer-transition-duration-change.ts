import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getLayerOption} from '../../../defaults.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {LayerUtils} from '../../../domain/layers/layer-util.js';

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
				const layer = +(options.layer);
				const layerFromState = theLayerUtils.getLayerFromCompositionState(layer);
				const layerTransitionDurationId = layerFromState?.transition?.duration?.id + '';

				const inputValue: number = (+(options.value));
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
