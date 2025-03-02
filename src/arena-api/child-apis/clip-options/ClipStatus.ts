import { CommonOptionsPropertyChoice } from "../common-options/properties/CommonOptionsPropertyChoice";
import { CommonOptionsPropertyString } from "../common-options/properties/CommonOptionsPropertyString";
import {CommonOptionsPropertyRange} from '../common-options/properties/CommonOptionsPropertyRange';

export interface ClipStatus {
  id: number,
  name: CommonOptionsPropertyString,
  connected: CommonOptionsPropertyChoice
  audio?: {
    volume: CommonOptionsPropertyRange
  }
  video?:{
    opacity: CommonOptionsPropertyRange
    sourceparams?: {
      Text?: CommonOptionsPropertyString
    }
  },
  transport?:{
    controls?: {
      speed: CommonOptionsPropertyRange
    }
  }

}
