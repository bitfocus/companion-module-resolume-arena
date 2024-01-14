import { LayerOptionsPropertyChoice } from "../layer-options/properties/LayerOptionsPropertyChoice";
import { LayerOptionsPropertyString } from "../layer-options/properties/LayerOptionsPropertyString";

export interface ClipStatus {
  id: number,
  name: LayerOptionsPropertyString,
  connected: LayerOptionsPropertyChoice
}