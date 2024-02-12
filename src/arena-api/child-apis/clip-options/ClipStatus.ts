import { CommonOptionsPropertyChoice } from "../common-options/properties/CommonOptionsPropertyChoice";
import { CommonOptionsPropertyString } from "../common-options/properties/CommonOptionsPropertyString";

export interface ClipStatus {
  id: number,
  name: CommonOptionsPropertyString,
  connected: CommonOptionsPropertyChoice
}