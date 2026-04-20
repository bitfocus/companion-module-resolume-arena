import {CompanionActionDefinition} from '@companion-module/base';
import ArenaOscApi from '../../../arena-api/osc';
import ArenaRestApi from '../../../arena-api/rest';
import {ColumnUtils} from '../../../domain/columns/column-util';
import {WebsocketInstance} from '../../../websocket';
import {ResolumeArenaModuleInstance} from '../../../index';
import {parameterStates} from '../../../state';

function lookupColumnIndexByName(name: string): number | undefined {
	const states = parameterStates.get();
	for (const key of Object.keys(states)) {
		const match = key.match(/^\/composition\/columns\/(\d+)\/name$/);
		if (match) {
			const stored = String(states[key]?.value ?? '');
			// Resolume displays '#' in a column name as the column number
			const display = stored.replace('#', match[1]);
			if (stored === name || display === name) {
				return parseInt(match[1], 10);
			}
		}
	}
	return undefined;
}

export function connectColumn(
	restApi: () => (ArenaRestApi | null),
	websocketApi: () => (WebsocketInstance | null),
	_oscApi: () => (ArenaOscApi | null),
	columnUtils: () => (ColumnUtils | null),
	resolumeArenaModuleInstance: ResolumeArenaModuleInstance
): CompanionActionDefinition {
	return {
		name: 'Connect Column',
		options: [
			{
				id: 'lookupMode',
				type: 'dropdown',
				label: 'Lookup mode',
				choices: [
					{id: 'byIndex', label: 'By index'},
					{id: 'byName', label: 'By name'},
				],
				default: 'byIndex',
			},
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
				label: 'Action',
				isVisible: (options) => options.lookupMode === 'byIndex',
			},
			{
				type: 'textinput',
				id: 'value',
				label: 'Value',
				useVariables: true,
				isVisible: (options) => options.lookupMode === 'byIndex',
			},
			{
				type: 'textinput',
				id: 'name',
				label: 'Column name',
				useVariables: true,
				isVisible: (options) => options.lookupMode === 'byName',
			}
		],
		callback: async ({options}: {options: any}) => {
			let theApi = restApi();
			let theColumnUtils = columnUtils();
			if (theApi && theColumnUtils) {
				let column: number | undefined;

				if (options.lookupMode === 'byName') {
					const name = await resolumeArenaModuleInstance.parseVariablesInString(options.name ?? '');
					column = lookupColumnIndexByName(name);
					if (column === undefined) {
						resolumeArenaModuleInstance.log('error', `connectColumn: no column found with name "${name}"`);
						return;
					}
				} else {
					const action = options.action;
					const value = +await resolumeArenaModuleInstance.parseVariablesInString(options.value);
					if (action == undefined) {
						return;
					}
					switch (action) {
						case 'set':
							column = value;
							break;
						case 'add':
							column = theColumnUtils.calculateConnectedNextColumn(value);
							break;
						case 'subtract':
							column = theColumnUtils.calculateConnectedPreviousColumn(value);
							break;
						default:
							break;
					}
				}

				if (column != undefined) {
					websocketApi()?.triggerPath('/composition/columns/' + column + '/connect', false);
					websocketApi()?.triggerPath('/composition/columns/' + column + '/connect', true);
				}
			}
		}
	};
}
