import { SomeCompanionFeedbackInputField, combineRgb } from "@companion-module/base";
import {createCanvas} from 'canvas';

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

export function  getLayerOption(): SomeCompanionFeedbackInputField[] {
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

export function  getLayerGroupOption(): SomeCompanionFeedbackInputField[] {
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

export function  getDefaultLayerColumnOptions() {
    return {
        layer: '-1',
        column: '-1',
    };
}

export function  getDefaultStyleRed() {
    return {
        color: combineRgb(0, 0, 0),
        bgcolor: combineRgb(255, 0, 0),
    };
}

export function  getDefaultStyleGreen() {
    return {
        color: combineRgb(0, 0, 0),
        bgcolor: combineRgb(0, 255, 0),
    };
}

export function  getDefaultStyleBlue() {
    return {
        color: combineRgb(0, 0, 0),
        bgcolor: combineRgb(0, 0, 255),
    };
}

export function drawPercentage(percentage: number): string | undefined {
	// Dimensions for the image
	const width = 72;
	const height = 72;

	// Instantiate the canvas object
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	// Fill the rectangle with purple
	context.fillStyle = '#0000ff';
	context.fillRect(0, 72 - height * percentage, width, height);

	// Write the image to file
	const buffer = canvas.toBuffer('image/png');
	return buffer.toString('base64');
}
