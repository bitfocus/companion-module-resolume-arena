import {CompanionVariableDefinition} from '@companion-module/base';

export function getColumnApiVariables(): any[] {
	return [
		{variableId: 'selectedColumn', name: 'selectedColumn'},
		{variableId: 'connectedColumn', name: 'connectedColumn'},
	];
}
