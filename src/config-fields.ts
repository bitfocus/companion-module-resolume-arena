import { Regex, SomeCompanionConfigField } from "@companion-module/base";

export interface ResolumeArenaConfig {
  host: string;
  port: number;
  webapiPort: number;
  useSSL: boolean;
  useRest: boolean;
  useCroppedThumbs: boolean;
}

export function configFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'Resolume Host IP',
      width: 8,
      regex: Regex.IP,
      default: '127.0.0.1'
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
      type: 'number',
      id: 'webapiPort',
      label: 'Resolume WebAPI Port',
      width: 6,
      min: 1,
      max: 65536,
      default: 8080
    },
    {
      type: 'checkbox',
      id: 'useRest',
      label: 'Use Rest for web api calls (if false fallback to OSC)',
      width: 6,
      default: true
    },
    {
      type: 'checkbox',
      id: 'useSSL',
      label: 'Use SSL for web api calls',
      width: 6,
      default: false
    },
    {
      type: 'checkbox',
      id: 'useCroppedThumbs',
      label: 'Hide black banners on thumbnails (might be slower)',
      width: 6,
      default: false
    },
  ]
};