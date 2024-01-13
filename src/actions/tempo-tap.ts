import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc"
import ArenaRestApi from "../arena-api/rest";

export function tempoTap(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Tap Tempo',
    options: [],
    callback: async ({ }: { options: any }) => {
      oscApi()?.tempoTap();
    }
  };
}
