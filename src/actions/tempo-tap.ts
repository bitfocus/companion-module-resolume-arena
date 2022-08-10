import { CompanionAction } from "../../../../instance_skel_types"
import ArenaOscApi from "../arena-api/osc"
import ArenaRestApi from "../arena-api/rest";

export function tempoTap(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionAction {
  return {
    label: 'Tap Tempo',
    options: [],
    callback: async ({ }: { options: any }) => {
      oscApi()?.tempoTap();
    }
  };
}
