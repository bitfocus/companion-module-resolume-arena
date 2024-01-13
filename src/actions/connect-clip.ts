import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function connectClip(restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Trigger Clip',
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
    callback: async ({ options }: { options: any }): Promise<void> => {
      let rest = restApi();
      if (rest) {
        await rest.Clips.connect(options.layer, options.column);
      } else {
        oscApi()?.connectClip(options.layer, options.column);
      }
    }
  }
}