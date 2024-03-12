import {SomeCompanionFeedbackInputField, combineRgb} from '@companion-module/base';

export function getDeckOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'deck',
			type: 'number',
			label: 'Deck',
			default: 1,
			min: 1,
			max: 65535,
		},
	];
}

export function getColumnOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'column',
			type: 'number',
			label: 'Column',
			default: 1,
			min: 1,
			max: 65535,
		},
	];
}

export function getLayerOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'layer',
			type: 'number',
			label: 'Layer',
			default: 1,
			min: 1,
			max: 65535,
		},
	];
}

export function getClipOption(): SomeCompanionFeedbackInputField[] {
	return [
		...getLayerOption(),
		...getColumnOption()
	];
}

export function getLayerGroupOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'layerGroup',
			type: 'number',
			label: 'Layer Group',
			default: 1,
			min: 1,
			max: 65535,
		},
	];
}

export function getDefaultLayerColumnOptions() {
	return {
		layer: 1,
		column: 1,
	};
}

export function getDefaultDeckOptions() {
	return {
		deck: 1,
	};
}

export function getDefaultColumnOptions() {
	return {
		column: 1,
	};
}

export function getDefaultStyleRed() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(255, 0, 0),
	};
}

export function getDefaultStyleGreen() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 0),
	};
}

export function getDefaultStyleBlue() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 0, 255),
	};
}

export function getSpeedValue(inputValue: number): number{
	return Math.pow(inputValue/10, Math.log(4) / Math.log(10))
}