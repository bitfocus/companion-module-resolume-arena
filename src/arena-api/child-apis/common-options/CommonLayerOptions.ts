import {LayerOptionsAudioEffect} from './LayerOptionsAudioEffect';
import { CommonOptionsPropertyBoolean } from './properties/CommonOptionsPropertyBoolean';
import { CommonOptionsPropertyChoice } from './properties/CommonOptionsPropertyChoice';
import { CommonOptionsPropertyRange } from './properties/CommonOptionsPropertyRange';
import { CommonOptionsPropertyString } from './properties/CommonOptionsPropertyString';

export interface CommonLayerOptions {
	id: number;
	name?: CommonOptionsPropertyString;
	colorid?: CommonOptionsPropertyChoice;
	bypassed?: CommonOptionsPropertyBoolean;
	solo?: CommonOptionsPropertyBoolean;
	selected?: CommonOptionsPropertyBoolean;
	crossfadergroup?: CommonOptionsPropertyChoice;
	maskmode?: CommonOptionsPropertyChoice;
	master?: CommonOptionsPropertyRange;
	ignorecolumntrigger?: CommonOptionsPropertyBoolean;
	faderstart?: CommonOptionsPropertyBoolean;
	dashboard?: {[index: string]: CommonOptionsPropertyString};
	audio?: {
		volume?: CommonOptionsPropertyRange;
		pan?: CommonOptionsPropertyRange;
		effects?: LayerOptionsAudioEffect[];
	};
	video?: {
		opacity?: CommonOptionsPropertyRange;
	};
	transition?: {
		duration?: CommonOptionsPropertyRange;
	};
}

export interface CommonLayerWriteOptions {
	name?: string;
	colorid?: 'a' | 'b';
	bypassed?: boolean;
	solo?: boolean;
	crossfadergroup?: CommonOptionsPropertyChoice;
	maskmode?: CommonOptionsPropertyChoice;
	master?: CommonOptionsPropertyRange;
	ignorecolumntrigger?: boolean;
	faderstart?: boolean;
	dashboard?: {[index: string]: CommonOptionsPropertyString};
	audio?: {
		volume?: CommonOptionsPropertyRange;
		pan?: CommonOptionsPropertyRange;
		effects?: LayerOptionsAudioEffect[];
	};
}
