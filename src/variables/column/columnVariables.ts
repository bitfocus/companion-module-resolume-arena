import {CompanionVariableDefinition} from '@companion-module/base';

export function getColumnApiVariables(): CompanionVariableDefinition[] {
	return [
		{variableId: 'selectedColumn', name: 'selectedColumn'},
		{variableId: 'connectedColumn', name: 'connectedColumn'},
	];
}
