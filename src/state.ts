import { createState } from "@persevie/statemanjs";
import { Composition, ParameterCollection } from "./domain/api";

const default_composition = {
    dashboard: {},
    crossfader: {},
    tempocontroller: {},
    decks: [],
    layers: [],
    columns: [],
    layergroups: []
};

// Create a new state with initial default value
export const compositionState = createState<Composition>(default_composition);
export const parameterStates =createState<ParameterCollection>({});;
