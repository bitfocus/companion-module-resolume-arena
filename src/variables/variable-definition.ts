import type {CompanionVariableDefinitions} from '@companion-module/base';

/** A variable definition together with its id, as produced by the variable generators. */
export interface VariableDefinitionEntry {
	variableId: string;
	name: string;
}

/** Converts generator entries to the id-keyed object the module API expects. */
export function toVariableDefinitions(entries: VariableDefinitionEntry[]): CompanionVariableDefinitions {
	const definitions: CompanionVariableDefinitions = {};
	for (const {variableId, name} of entries) {
		definitions[variableId] = {name};
	}
	return definitions;
}
