import {CommonLayerOptions, CommonLayerWriteOptions} from '../common-options/CommonLayerOptions.js';
import { LayerOptions } from '../layer-options/LayerOptions.js';

export interface LayerGroupOptions extends CommonLayerOptions {
	layers: Array<LayerOptions>;
}

export interface LayerGroupWriteOptions extends CommonLayerWriteOptions {}
