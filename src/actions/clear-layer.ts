import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function clearLayer(restApi: () => ArenaRestApi | null, _oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Clear Layer',
    options: [
      {
        id: 'layer',
        type: 'number',
        label: 'Layer number',
        default: 1,
        min: 1,
        max: 65535
      }
    ],
    callback: async ({ options }: { options: any }) =>
      await restApi()?.Layers.clear(options.layer)
  }
}