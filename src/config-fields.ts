import { Regex, SomeCompanionConfigField } from "@companion-module/base";

export interface ResolumeArenaConfig {
  host: string;
  port: number;
  webapiPort: number;
  useSSL: boolean;
}

export function configFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Resolume Host IP',
      width: 8,
      regex: Regex.IP
    },
    {
      type: 'number',
      id: 'port',
      label: 'Resolume OSC Port',
      width: 6,
      min: 1,
      max: 65536,
      default: 7000
    },
    {
      type: 'checkbox',
      id: 'useSSL',
      label: 'Use SSL for web api calls',
      width: 6,
      default: false
    },
    {
      type: 'number',
      id: 'webapiPort',
      label: 'Resolume WebAPI Port',
      width: 6,
      min: 1,
      max: 65536,
      default: 8080
    },
  ]
};