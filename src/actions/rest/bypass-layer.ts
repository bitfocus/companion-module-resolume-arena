import { LayerOptions } from "../../arena-api/child-apis/layer-options/LayerOptions";
import { CompanionAction } from "../../../../../instance_skel_types"
import ArenaRestApi from "../../arena-api/rest"

export function bypassLayer(restApi: () => ArenaRestApi | null): CompanionAction {
  return {
    label: 'Bypass Layer',
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
        id: 'bypass',
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
        label: 'Bypass'
      }
    ],
    callback: async ({ options }: { options: any }) => {
      let theApi = restApi();
      if (options.bypass == 'toggle') {
        var settings = (await theApi?.Layers.getSettings(options.layer)) as LayerOptions;
        await theApi?.Layers.updateSettings(options.layer, {
          bypassed: !settings.bypassed?.value
        })
      } else {
        await theApi?.Layers.updateSettings(options.layer, {
          bypassed: options.bypass == 'on'
        })
      }
    }
  }
}