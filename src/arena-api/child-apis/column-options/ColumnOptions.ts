import { CommonOptionsPropertyBoolean } from '../common-options/properties/CommonOptionsPropertyBoolean';
import { CommonOptionsPropertyChoice } from '../common-options/properties/CommonOptionsPropertyChoice';
import { CommonOptionsPropertyString } from '../common-options/properties/CommonOptionsPropertyString';

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
