import { CommonOptionsPropertyBoolean } from '../common-options/properties/CommonOptionsPropertyBoolean.js';
import { CommonOptionsPropertyChoice } from '../common-options/properties/CommonOptionsPropertyChoice.js';
import { CommonOptionsPropertyString } from '../common-options/properties/CommonOptionsPropertyString.js';

export interface ColumnOptions {
	id: number;
	name?: CommonOptionsPropertyString;
	colorid?: CommonOptionsPropertyChoice;
	connected?: CommonOptionsPropertyBoolean;
}

export interface ColumnWriteOptions {
	name?: string;
	colorid?: 'a' | 'b';
}
