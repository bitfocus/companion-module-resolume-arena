import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function selectClip(restApi: () => ArenaRestApi | null, _oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Select Clip',
    options: [
      {
        id: 'layer',
        type: 'number',
        label: 'Layer number',
        default: 1,
        min: 1,
        max: 65535
      },
      {
        id: 'column',
        type: 'number',
        label: 'Column number',
        default: 1,
        min: 1,
        max: 65535
      }
    ],
    callback: async ({ options }: { options: any }) =>
      await restApi()?.Clips.select(options.layer, options.column)
  }
}