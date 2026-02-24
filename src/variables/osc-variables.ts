// @ts-nocheck
/** The number of layers to always pre-register variables for */
export const OSC_DEFAULT_LAYERS = 10;
/**
 * Generate OSC variable definitions for a given layer number.
 * Called for layers 1-10 at init, and dynamically for layers beyond 10.
 */
export function getOscLayerVariables(layer) {
    const prefix = `osc_layer_${layer}`;
    return [
        { variableId: `${prefix}_elapsed`, name: `OSC Layer ${layer} / Elapsed Time` },
        { variableId: `${prefix}_duration`, name: `OSC Layer ${layer} / Duration` },
        { variableId: `${prefix}_remaining`, name: `OSC Layer ${layer} / Remaining Time` },
        { variableId: `${prefix}_remaining_seconds`, name: `OSC Layer ${layer} / Remaining (seconds)` },
        { variableId: `${prefix}_progress`, name: `OSC Layer ${layer} / Progress (%)` },
        { variableId: `${prefix}_clip_name`, name: `OSC Layer ${layer} / Clip Name` },
    ];
}
/**
 * Generate all OSC variable definitions — layers 1-10 always,
 * plus any additional layers discovered dynamically.
 */
export function getAllOscVariables(extraLayers) {
    const variables = [];
    // Composition-level variables
    variables.push({ variableId: 'osc_active_column', name: 'OSC / Active Column' });
    variables.push({ variableId: 'osc_active_column_name', name: 'OSC / Active Column Name (rename columns in Resolume for custom names)' });
    // Always register layers 1-10
    for (let l = 1; l <= OSC_DEFAULT_LAYERS; l++) {
        variables.push(...getOscLayerVariables(l));
    }
    // Register any dynamically discovered layers beyond 10
    for (const l of extraLayers) {
        if (l > OSC_DEFAULT_LAYERS) {
            variables.push(...getOscLayerVariables(l));
        }
    }
    return variables;
}
