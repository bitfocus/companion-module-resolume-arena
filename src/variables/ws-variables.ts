import {CompanionVariableDefinition} from '@companion-module/base'

export const WS_DEFAULT_LAYERS = 10

export function getWsLayerVariables(layer: number): CompanionVariableDefinition[] {
	const prefix = `ws_layer_${layer}`
	return [
		{ variableId: `${prefix}_elapsed`, name: `WS Layer ${layer} / Elapsed Time` },
		{ variableId: `${prefix}_elapsed_seconds`, name: `WS Layer ${layer} / Elapsed (seconds)` },
		{ variableId: `${prefix}_duration`, name: `WS Layer ${layer} / Duration` },
		{ variableId: `${prefix}_remaining`, name: `WS Layer ${layer} / Remaining Time` },
		{ variableId: `${prefix}_remaining_seconds`, name: `WS Layer ${layer} / Remaining (seconds)` },
		{ variableId: `${prefix}_progress`, name: `WS Layer ${layer} / Progress (%)` },
	]
}

export function getAllWsVariables(): CompanionVariableDefinition[] {
	const variables: CompanionVariableDefinition[] = []
	for (let l = 1; l <= WS_DEFAULT_LAYERS; l++) {
		variables.push(...getWsLayerVariables(l))
	}
	return variables
}
