import { CompanionAction } from "../../../../../instance_skel_types"
import { ArenaOscApi } from "../../arena-api/osc"

export function oscTriggerClip(oscApi: () => ArenaOscApi | null): CompanionAction {
  return {
    label: 'Start Clip',
    options: [
      {
        type: 'number',
        label: 'Layer',
        id: 'layer',
        min: 1,
        max: 100,
        default: 1,
        required: true
      },
      {
        type: 'number',
        label: 'Column',
        id: 'column',
        min: 1,
        max: 100,
        default: 1,
        required: true
      }
    ],
    callback: async ({ options }: { options: any }) => {
      oscApi()?.connectClip(options.layer, options.column);
    }
  }
}