import {CommonOptionsPropertyString} from './properties/CommonOptionsPropertyString';
import {CommonOptionsPropertyBoolean} from './properties/CommonOptionsPropertyBoolean';

export interface LayerOptionsAudioEffect {
	name?: string;
	bypassed?: CommonOptionsPropertyBoolean;
	params?: {[index: string]: CommonOptionsPropertyString};
}
