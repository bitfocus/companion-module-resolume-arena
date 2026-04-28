import {getClipApiVariables} from './variables/clip/clipVariables.js';
import {getColumnApiVariables} from './variables/column/columnVariables.js';

export function getApiVariables(): Array<{variableId: string; name: string}> {
	return [
		...getClipApiVariables(),
		...getColumnApiVariables()
	];
}
