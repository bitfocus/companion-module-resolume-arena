import type {VariableDefinitionEntry} from '../variable-definition.js';

export function getColumnApiVariables(): VariableDefinitionEntry[] {
	return [
		{variableId: 'selectedColumn', name: 'selectedColumn'},
		{variableId: 'connectedColumn', name: 'connectedColumn'},
	];
}
