import { LayerOptionsPropertyString } from "./properties/LayerOptionsPropertyString";
import { LayerOptionsPropertyBoolean } from "./properties/LayerOptionsPropertyBoolean";


export interface LayerOptionsAudioEffect {
  name?: string;
  bypassed?: LayerOptionsPropertyBoolean;
  params?: { [index: string]: LayerOptionsPropertyString; };
}
