import { CompanionAction } from "../../../../../instance_skel_types"
import ArenaRestApi from "../../arena-api/rest"

export function clearLayer(restApi: () => ArenaRestApi | null): CompanionAction {
  return {
    label: 'Clear Layer',
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