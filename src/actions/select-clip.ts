import { CompanionAction } from "../../../../instance_skel_types"
import ArenaApi from "../arena-api/arena"

export function selectClip(api: () => ArenaApi | null): CompanionAction {
  return {
    label: 'Select Clip',
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
      await api()?.Clips.select(options.layer, options.column)
  }
}