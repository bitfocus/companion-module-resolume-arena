import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {getLayerGroupOption} from '../../../defaults.js';
import {LayerGroupUtils} from '../../../domain/layer-groups/layer-group-util.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

export function connectLayerGroupColumn(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	_oscApi: () => (ArenaOscApi | null),
	layerGroupUtils: () => (LayerGroupUtils | null)
	, resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinition {
	return {
		name: 'Connect Layer Group Column',
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
				if (action != undefined) {
					let column: number | undefined;
					const layerGroup = +(options.layerGroup);
					const value = +(options.value);
					switch (options.action) {
						case 'set':
							column = value;
							break;
						case 'add':
							column = theLayerGroupUtils.calculateNextConnectedLayerGroupColumn(layerGroup, value);
							break;
						case 'subtract':
							column = theLayerGroupUtils.calculatePreviousConnectedLayerGroupColumn(layerGroup, value);
							break;
						default:
							break;
					}
					if (column != undefined) {
						websocketApi()?.triggerPath('/composition/layergroups/' + layerGroup + '/columns/' + column + '/connect', false);
						websocketApi()?.triggerPath('/composition/layergroups/' + layerGroup + '/columns/' + column+ '/connect', true);
					}
				}
			}
		},
	};
}
