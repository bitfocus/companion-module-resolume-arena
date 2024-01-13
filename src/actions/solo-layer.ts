import { LayerOptions } from "../arena-api/child-apis/layer-options/LayerOptions";
import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function soloLayer(restApi: () => ArenaRestApi | null, _oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Solo Layer',
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
        id: 'solo',
        type: 'dropdown',
        choices: [
          {
            id: 'on',
            label: 'On'
          },
          {
            id: 'off',
            label: 'Off'
          },
          {
            id: 'toggle',
            label: 'Toggle'
          }
        ],
        default: 'toggle',
        label: 'Solo'
      }
    ],
    callback: async ({ options }: { options: any }) => {
      let theApi = restApi();
      if (options.bypass == 'toggle') {
        var settings = (await theApi?.Layers.getSettings(options.layer)) as LayerOptions;
        await theApi?.Layers.updateSettings(options.layer, {
          solo: !settings.solo?.value
        })
      } else {
        await theApi?.Layers.updateSettings(options.layer, {
          solo: options.solo == 'on'
        })
      }
    }
  }
}