import {combineRgb} from '@companion-module/base';
import {graphics} from 'companion-module-utils';
import {PNG} from 'pngjs';
import {ImageTransformer, PixelFormat, ResizeMode} from '@julusian/image-rs';
import {compositionState} from './state';

export function drawVolume(volume: number): Uint8Array | undefined {
	return drawPercentage(Math.pow(10, (volume / 40)));
}

export function drawPercentage(percentage: number): Uint8Array | undefined {
	if (percentage >= 1.01) {
		const frontColor = createColorBlock(combineRgb(255, 0, 0));
		const backColor = createColorBlock(combineRgb(0, 0, 255), percentage / 10);
		return graphics.stackImage([graphics.rect(frontColor), graphics.rect(backColor)]);
	} else {
		const frontColor = createColorBlock(combineRgb(0, 0, 255));
		const backColor = createColorBlock(combineRgb(0, 0, 0), percentage);
		return graphics.stackImage([graphics.rect(frontColor), graphics.rect(backColor)]);
	}
}

export function drawThumb(thumb: string): Uint8Array {
	const inputDecoded = PNG.sync.read(Buffer.from(thumb, 'base64'));
	const video = compositionState.get()!.video!;
	const out = ImageTransformer.fromBuffer(
		inputDecoded.data,
		inputDecoded.width,
		inputDecoded.height,
		PixelFormat.Rgba
	)
		.scale(inputDecoded.width, inputDecoded.width / video.width! * video.height!, ResizeMode.Fill)
		.scale(64, 64, ResizeMode.Fill)
		.toBufferSync(PixelFormat.Rgb);

	return out;
}

function createColorBlock(fillColor: number, percentage: number = 0) {
	return {
		width: 72,
		height: 72,
		color: combineRgb(255, 0, 0),
		rectWidth: 72,
		rectHeight: 72 - 72 * percentage,
		strokeWidth: 0,
		opacity: 255,
		fillColor: fillColor,
		fillOpacity: 255,
		offsetX: 0,
		offsetY: 0
	};
}