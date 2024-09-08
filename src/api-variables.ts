import {CompanionVariableDefinition} from '@companion-module/base';
import {getClipApiVariables} from './variables/clip/clipVariables';

export function getApiVariables(): CompanionVariableDefinition[] {
	return [
		...getClipApiVariables()
	];
}
