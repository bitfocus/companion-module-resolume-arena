import {SomeCompanionFeedbackInputField, combineRgb, Regex} from '@companion-module/base';

export function getDeckOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'deck',
			type: 'textinput',
			label: 'Deck',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER
		}
	];
}

export function getColumnOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'column',
			type: 'textinput',
			label: 'Column',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER,
		}
	];
}

export function getLayerOption(): SomeCompanionFeedbackInputField[] {
	return [
		{
			id: 'layer',
			type: 'textinput',
			label: 'Layer',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER
		}
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
			type: 'textinput',
			label: 'Layer Group',
			default: '1',
			useVariables: true,
			regex: Regex.NUMBER
		}
	];
}

export function getDefaultLayerColumnOptions() {
	return {
		layer: '1',
		column: '1'
	};
}

export function getDefaultDeckOptions() {
	return {
		deck: '1'
	};
}

export function getDefaultColumnOptions() {
	return {
		column: '1'
	};
}

export function getDefaultStyleRed() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(255, 0, 0)
	};
}

export function getDefaultStyleGreen() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 255, 0)
	};
}

export function getDefaultStyleBlue() {
	return {
		color: combineRgb(0, 0, 0),
		bgcolor: combineRgb(0, 0, 255)
	};
}

export function getSpeedValue(inputValue: number): number {
	return Math.pow(inputValue / 10, Math.log(4) / Math.log(10));
}
