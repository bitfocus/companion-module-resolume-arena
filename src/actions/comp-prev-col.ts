import { CompanionAction } from "../../../../instance_skel_types"
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function compPrevCol(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionAction {
  return {
    label: 'Composition Previous Column',
    options: [
      {
        type: 'number',
        label: 'Last (max) Column',
        id: 'colMaxCompPrev',
        min: 1,
        max: 65536,
        default: 4,
        required: true
      }
    ],

    callback: async ({ options }: { options: any }) => {
      oscApi()?.compNextCol(options.colMaxCompNext);
    }
  }
}