import { CompanionAction } from "../../../../instance_skel_types"
import ArenaOscApi from "../arena-api/osc"
import ArenaRestApi from "../arena-api/rest";

export function groupPrevCol(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionAction {
  return {
    label: 'Group Previous Column',
    options: [
      {
        type: 'number',
        label: 'Group Number',
        id: 'groupPrev',
        min: 1,
        max: 100,
        default: 1,
        required: true
      },
      {
        type: 'number',
        label: 'Last Column',
        id: 'colMaxGroupPrev',
        min: 1,
        max: 100,
        default: 4,
        required: true
      }
    ],
    callback: async ({ options }: { options: any }) => {
      oscApi()?.groupPrevCol(options.groupPrev, options.colMaxGroupPrev);
    }
  };
}