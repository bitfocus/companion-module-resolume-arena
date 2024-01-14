import {LayerOptionsAudioEffect} from './LayerOptionsAudioEffect';
import {LayerOptionsPropertyString} from './properties/LayerOptionsPropertyString';
import {LayerOptionsPropertyBoolean} from './properties/LayerOptionsPropertyBoolean';
import {LayerOptionsPropertyRange} from './properties/LayerOptionsPropertyRange';
import {LayerOptionsPropertyChoice} from './properties/LayerOptionsPropertyChoice';

export interface LayerOptions {
	name?: LayerOptionsPropertyString;
	colorid?: LayerOptionsPropertyChoice;
	bypassed?: LayerOptionsPropertyBoolean;
	solo?: LayerOptionsPropertyBoolean;
	selected?: LayerOptionsPropertyBoolean;
	crossfadergroup?: LayerOptionsPropertyChoice;
	maskmode?: LayerOptionsPropertyChoice;
	master?: LayerOptionsPropertyRange;
	ignorecolumntrigger?: LayerOptionsPropertyBoolean;
	faderstart?: LayerOptionsPropertyBoolean;
	dashboard?: {[index: string]: LayerOptionsPropertyString};
	audio?: {
		volume?: LayerOptionsPropertyRange;
		pan?: LayerOptionsPropertyRange;
		effects?: LayerOptionsAudioEffect[];
	};
	clips: Array<{connected: {value: 'Disconected' | 'Empty' | 'Connected'}}>;
}

export interface LayerWriteOptions {
	name?: string;
	colorid?: 'a' | 'b';
	bypassed?: boolean;
	solo?: boolean;
	crossfadergroup?: LayerOptionsPropertyChoice;
	maskmode?: LayerOptionsPropertyChoice;
	master?: LayerOptionsPropertyRange;
	ignorecolumntrigger?: boolean;
	faderstart?: boolean;
	dashboard?: {[index: string]: LayerOptionsPropertyString};
	audio?: {
		volume?: LayerOptionsPropertyRange;
		pan?: LayerOptionsPropertyRange;
		effects?: LayerOptionsAudioEffect[];
	};
}
