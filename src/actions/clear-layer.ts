import { CompanionAction } from "../../../../instance_skel_types"
import ArenaApi from "../arena-api/arena"

export function clearLayer(api: () => ArenaApi | null): CompanionAction {
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
      await api()?.Layers.clear(options.layer)
  }
}