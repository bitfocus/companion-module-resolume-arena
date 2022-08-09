import { CompanionAction } from "../../../../instance_skel_types"
import ArenaApi from "../arena-api/arena"

export function connectClip(api: () => ArenaApi | null): CompanionAction {
  return {
    label: 'Connect Clip',
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
    callback: async ({ options }: { options: any }): Promise<void> =>
      await api()?.Clips.connect(options.layer, options.column)
  }
}