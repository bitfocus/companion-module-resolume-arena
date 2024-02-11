import {CommonLayerOptions, CommonLayerWriteOptions} from '../common-options/CommonLayerOptions';
import { LayerOptions } from '../layer-options/LayerOptions';

export interface LayerGroupOptions extends CommonLayerOptions {
	layers: Array<LayerOptions>;
}

export interface LayerGroupWriteOptions extends CommonLayerWriteOptions {}
