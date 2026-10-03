import {CommonOptionsPropertyString} from './properties/CommonOptionsPropertyString.js';
import {CommonOptionsPropertyBoolean} from './properties/CommonOptionsPropertyBoolean.js';

export interface LayerOptionsAudioEffect {
	name?: string;
	bypassed?: CommonOptionsPropertyBoolean;
	params?: {[index: string]: CommonOptionsPropertyString};
}
