import {CompanionVariableDefinition} from '@companion-module/base';
import {getClipApiVariables} from './variables/clip/clipVariables';
import {getColumnApiVariables} from './variables/column/columnVariables';

export function getApiVariables(): CompanionVariableDefinition[] {
	return [
		...getClipApiVariables(),
		...getColumnApiVariables()
	];
}
