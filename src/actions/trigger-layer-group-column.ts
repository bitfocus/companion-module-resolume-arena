import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../arena-api/osc';
import ArenaRestApi from '../arena-api/rest';
import {getLayerGroupOption} from '../defaults';
import {LayerGroupUtils} from '../domain/layer-groups/layer-group-util';
import {WebsocketInstance} from '../websocket';

export function triggerLayerGroupColumn(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	layerGroupUtils: () => LayerGroupUtils | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Layer Group Column',
		options: [
			...getLayerGroupOption(),
			{
				id: 'action',
				type: 'dropdown',
				choices: [
					{
						id: 'add',
						label: '+',
					},
					{
						id: 'subtract',
						label: '-',
					},
					{
						id: 'set',
						label: '=',
					},
				],
				default: 'set',
				label: 'Action',
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value',
				useVariables: true,
			},
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theLayerGroupUtils = layerGroupUtils();
			if (theApi && theLayerGroupUtils) {
				const action = options.action;
				const value = +options.value as number;
				if (action != undefined) {
					let column: number | undefined;
					switch (options.action) {
						case 'set':
							column = value;
							break;
						case 'add':
							column = theLayerGroupUtils.calculateNextLayerGroupColumn(options.layerGroup, value);
							break;
						case 'subtract':
							column = theLayerGroupUtils.calculatePreviousLayerGroupColumn(options.layerGroup, value);
							break;
						default:
							break;
					}
					if (column != undefined) {
						websocketApi()?.triggerPath('/composition/layergroups/' + options.layerGroup + '/columns/' + column + '/connect', false);
						websocketApi()?.triggerPath('/composition/layergroups/' + options.layerGroup + '/columns/' + column+ '/connect', true);
					}
				}
			}
		},
	};
}
