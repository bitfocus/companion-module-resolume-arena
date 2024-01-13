import { CompanionActionDefinition } from "@companion-module/base";
import ArenaOscApi from "../arena-api/osc";

export function customOscCommand(oscApi: () => ArenaOscApi | null): CompanionActionDefinition {
  return {
    name: 'Custom OSC Command',
    options: [
      {
        type: 'textinput',
        label: 'Custom OSC Path',
        id: 'customPath',
      },
      {
        type: 'dropdown',
        label: 'OSC Type Flag',
        id: 'oscType',
        tooltip: 'select the type of the value data',
        choices: [
          { id: 'i', label: 'integer' },
          { id: 'f', label: 'float' },
          { id: 's', label: 'string' }
        ],
        // multiple: false,
        default: 's'
      },
      {
        type: 'textinput',
        label: 'Value',
        id: 'customValue'
      }
    ],
    callback: async ({ options }: { options: any }) =>
      oscApi()?.customOsc(options.customPath, options.oscType, options.customValue)
  };
}