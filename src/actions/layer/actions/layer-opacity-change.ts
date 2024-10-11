import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {getLayerOption} from '../../../defaults';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';
import {LayerUtils} from '../../../domain/layers/layer-util';

export function layerOpacityChange(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	layerUtils: () => LayerUtils | null,
	resolumeArenaInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Layer Opacity Change',
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
				label: 'Value in percentage (e.g. 100 or 10)',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theLayerUtils = layerUtils();
			if (theApi && theLayerUtils) {
				const layer = +await resolumeArenaInstance.parseVariablesInString(options.layer);
				const inputValue: number = (+(await resolumeArenaInstance.parseVariablesInString(options.value))) / 100;
				const currentValue: number | undefined = (await resolumeArenaInstance.restApi!.Layers.getSettings(layer)).video?.opacity?.value;

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
						const layerObject = theLayerUtils.getLayerFromCompositionState(layer);
						let paramId = layerObject?.video!.opacity!.id! + '';
						websocketApi()?.subscribeParam(+paramId);
						websocketApi()?.setParam(paramId, value);
					}
				}
			}
		}
	};
}
