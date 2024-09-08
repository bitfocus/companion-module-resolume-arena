import {CompanionVariableDefinition} from '@companion-module/base';

export function getClipApiVariables(): CompanionVariableDefinition[] {
	return [
		{variableId: 'selectedClip', name: 'selectedClip'},
		{variableId: 'selectedClipLayer', name: 'selectedClipLayer'},
		{variableId: 'selectedClipColumn', name: 'selectedClipColumn'},
		{variableId: 'selectedClipName', name: 'selectedClipName'},

		{variableId: 'previewedClip', name: 'previewedClip'},
		{variableId: 'previewedClipLayer', name: 'previewedClipLayer'},
		{variableId: 'previewedClipColumn', name: 'previewedClipColumn'},
		{variableId: 'previewedClipName', name: 'previewedClipName'}
	];
}
