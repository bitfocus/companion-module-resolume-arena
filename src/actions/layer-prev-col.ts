import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function layerPrevCol(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Layer Previous Column',
    options: [
      {
        type: 'number',
        label: 'Layer Number',
        id: 'layerP',
        min: 1,
        max: 65536,
        default: 1,
        required: true
      },
      {
        type: 'number',
        label: 'Last (max) Column',
        id: 'colMaxLayerP',
        min: 1,
        max: 65536,
        default: 4,
        required: true
      }
    ],

    callback: async ({ options }: { options: any }) => {
      oscApi()?.layerPrevCol(options.layerP, options.colMaxLayerP);
    }
  }
}