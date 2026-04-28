import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc.js';
import ArenaRestApi from '../../../arena-api/rest.js';
import {ColumnUtils} from '../../../domain/columns/column-util.js';
import {WebsocketInstance} from '../../../websocket.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';

export function selectColumn(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	_oscApi: () => (ArenaOscApi | null),
	columnUtils: () => (ColumnUtils | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Select Column',
		options: [
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
				default: 'set',
				label: 'Action'
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value',
				useVariables: true
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theColumnUtils = columnUtils();
			if (theApi && theColumnUtils) {
				const action = options.action;
				const value = +(options.value);
				if (action != undefined) {
					let column: number | undefined;
					switch (options.action) {
						case 'set':
							column = value;
							break;
						case 'add':
							column = theColumnUtils.calculateSelectedNextColumn(value);
							break;
						case 'subtract':
							column = theColumnUtils.calculateSelectedPreviousColumn(value);
							break;
						default:
							break;
					}
					if (column != undefined) {
						websocketApi()?.triggerPath('/composition/columns/' + column + '/select', false);
						websocketApi()?.triggerPath('/composition/columns/' + column + '/select', true);
					}
				}
			}
		}
	};
}
