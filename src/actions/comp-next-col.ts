import { CompanionAction } from "../../../../instance_skel_types"
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function compNextCol(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionAction {
  return {
    label: 'Composition Next Column',
    options: [
      {
        type: 'number',
        label: 'Last (max) Column',
        id: 'colMaxCompNext',
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