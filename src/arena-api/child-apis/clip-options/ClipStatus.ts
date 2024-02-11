import { LayerOptionsPropertyChoice } from "../common-options/properties/LayerOptionsPropertyChoice";
import { LayerOptionsPropertyString } from "../common-options/properties/LayerOptionsPropertyString";

export interface ClipStatus {
  id: number,
  name: LayerOptionsPropertyString,
  connected: LayerOptionsPropertyChoice
}