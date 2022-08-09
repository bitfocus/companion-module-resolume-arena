import { LayerOptions } from "../arena-api/child-apis/layer-options/LayerOptions";
import { CompanionAction } from "../../../../instance_skel_types"
import ArenaApi from "../arena-api/arena"

export function soloLayer(api: () => ArenaApi | null): CompanionAction {
  return {
    label: 'Solo Layer',
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
      let theApi = api();
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