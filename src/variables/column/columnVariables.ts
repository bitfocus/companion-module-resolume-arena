export function getColumnApiVariables(): Array<{variableId: string; name: string}> {
	return [
		{variableId: 'selectedColumn', name: 'selectedColumn'},
		{variableId: 'connectedColumn', name: 'connectedColumn'},
	];
}
