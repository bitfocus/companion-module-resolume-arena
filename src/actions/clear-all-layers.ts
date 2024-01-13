import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";
import ArenaRestApi from "../arena-api/rest"

export function clearAllLayers(_restApi: () => ArenaRestApi | null, oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Clear All Layers',
    options: [],
    callback: async ({  }: { options: any }) => {
      // not available in rest api
      oscApi()?.clearAllLayers();
    }
  }
}