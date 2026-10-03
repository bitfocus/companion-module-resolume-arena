import type {VariableDefinitionEntry} from './variables/variable-definition.js';
import {getClipApiVariables} from './variables/clip/clipVariables.js';
import {getColumnApiVariables} from './variables/column/columnVariables.js';

export function getApiVariables(): VariableDefinitionEntry[] {
	return [
		...getClipApiVariables(),
		...getColumnApiVariables()
	];
}
