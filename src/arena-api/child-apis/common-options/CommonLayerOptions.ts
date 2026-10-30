import {LayerOptionsAudioEffect} from './LayerOptionsAudioEffect.js';
import { CommonOptionsPropertyBoolean } from './properties/CommonOptionsPropertyBoolean.js';
import { CommonOptionsPropertyChoice } from './properties/CommonOptionsPropertyChoice.js';
import { CommonOptionsPropertyRange } from './properties/CommonOptionsPropertyRange.js';
import { CommonOptionsPropertyString } from './properties/CommonOptionsPropertyString.js';

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
