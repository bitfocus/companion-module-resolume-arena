import { createState } from "@persevie/statemanjs";
import { Composition, ParameterCollection } from "./domain/api";

// Create a new state with initial default value
export const compositionState = createState<Composition|undefined>(undefined);
export const parameterStates =createState<ParameterCollection>({});;
