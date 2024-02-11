import {CommonLayerOptions, CommonLayerWriteOptions} from '../common-options/CommonLayerOptions';

export interface LayerOptions extends CommonLayerOptions {
	clips: Array<{connected: {value: 'Disconected' | 'Empty' | 'Connected'}}>;
}

export interface LayerWriteOptions extends CommonLayerWriteOptions {}
