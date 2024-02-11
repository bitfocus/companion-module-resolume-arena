import {LayerOptionsAudioEffect} from './LayerOptionsAudioEffect';
import { LayerOptionsPropertyBoolean } from './properties/LayerOptionsPropertyBoolean';
import { LayerOptionsPropertyChoice } from './properties/LayerOptionsPropertyChoice';
import { LayerOptionsPropertyRange } from './properties/LayerOptionsPropertyRange';
import { LayerOptionsPropertyString } from './properties/LayerOptionsPropertyString';

export interface CommonLayerOptions {
	id: number;
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
}

export interface CommonLayerWriteOptions {
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
