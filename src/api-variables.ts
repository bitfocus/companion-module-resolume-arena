import {CompanionVariableDefinition} from '@companion-module/base';
import {getClipApiVariables} from './variables/clip/clipVariables.js';
import {getColumnApiVariables} from './variables/column/columnVariables.js';

export function getApiVariables(): CompanionVariableDefinition[] {
	return [
		...getClipApiVariables(),
		...getColumnApiVariables()
	];
}
