import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {ColumnUtils} from '../../../domain/columns/column-util';
import {WebsocketInstance} from '../../../websocket';

export function triggerColumn(
	restApi: () => ArenaRestApi | null,
	websocketApi: () => WebsocketInstance | null,
	_oscApi: () => ArenaOscApi | null,
	columnUtils: () => ColumnUtils | null
): CompanionActionDefinition {
	return {
		name: 'Trigger Column',
		options: [
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
			let theColumnUtils = columnUtils();
			if (theApi && theColumnUtils) {
				const action = options.action;
				const value = +options.value as number;
				if (action != undefined) {
					let column: number | undefined;
					switch (options.action) {
						case 'set':
							column = value;
							break;
						case 'add':
							column = theColumnUtils.calculateNextColumn(value);
							break;
						case 'subtract':
							column = theColumnUtils.calculatePreviousColumn(value);
							break;
						default:
							break;
					}
					if (column != undefined) {
						websocketApi()?.triggerPath('/composition/columns/' + column + '/connect', false);
						websocketApi()?.triggerPath('/composition/columns/' + column + '/connect', true);
					}
				}
			}
		},
	};
}
