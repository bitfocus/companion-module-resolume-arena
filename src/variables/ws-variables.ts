import {compositionState} from '../state.js'

export const WS_DEFAULT_LAYERS = 10
export const WS_DEFAULT_LAYER_GROUPS = 5

export function getWsLayerGroupVariables(group: number): Array<{variableId: string; name: string}> {
	const prefix = `ws_layergroup_${group}`
	return [
		{variableId: `${prefix}_active`, name: `WS Layer Group ${group} / Active (1 if any clip is playing, 0 if not)`},
		{variableId: `${prefix}_connected_column`, name: `WS Layer Group ${group} / Connected Column (0 if none)`},
	]
}

export function getWsLayerVariables(layer: number): Array<{variableId: string; name: string}> {
	const prefix = `ws_layer_${layer}`
	return [
		{variableId: `${prefix}_active`, name: `WS Layer ${layer} / Active (1 if clip is playing, 0 if not)`},
		{variableId: `${prefix}_connected_column`, name: `WS Layer ${layer} / Connected Column (0 if none)`},
		{variableId: `${prefix}_elapsed`, name: `WS Layer ${layer} / Elapsed Time`},
		{variableId: `${prefix}_elapsed_seconds`, name: `WS Layer ${layer} / Elapsed (seconds)`},
		{variableId: `${prefix}_duration`, name: `WS Layer ${layer} / Duration`},
		{variableId: `${prefix}_remaining`, name: `WS Layer ${layer} / Remaining Time`},
		{variableId: `${prefix}_remaining_seconds`, name: `WS Layer ${layer} / Remaining (seconds)`},
		{variableId: `${prefix}_progress`, name: `WS Layer ${layer} / Progress (%)`},
	]
}

export function getAllWsVariables(): Array<{variableId: string; name: string}> {
	const state = compositionState.get()
	const layerCount = state?.layers?.length ?? WS_DEFAULT_LAYERS
	const groupCount = state?.layergroups?.length ?? WS_DEFAULT_LAYER_GROUPS
	const variables: Array<{variableId: string; name: string}> = []
	for (let l = 1; l <= layerCount; l++) {
		variables.push(...getWsLayerVariables(l))
	}
	for (let g = 1; g <= groupCount; g++) {
		variables.push(...getWsLayerGroupVariables(g))
	}
	return variables
}
