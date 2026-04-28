import {combineRgb} from '@companion-module/base';
import {graphics} from 'companion-module-utils';
import {PNG} from 'pngjs';
import {ImageTransformer, PixelFormat, ResizeMode} from '@julusian/image-rs';
import {compositionState} from './state.js';

function toBase64(buf: Uint8Array | undefined): string | undefined {
	return buf ? Buffer.from(buf).toString('base64') : undefined;
}

export function drawVolume(volume: number, dBMax: number = 0): string | undefined {
	let value = Math.pow(10, (volume / 20));
	value /= Math.pow(10, (dBMax / 20));
	value = Math.pow(value, 0.5);
	return drawPercentage(value);
}

export function drawPercentage(percentage: number): string | undefined {
	if (percentage >= 1.01) {
		const frontColor = createColorBlock(combineRgb(255, 0, 0));
		const backColor = createColorBlock(combineRgb(0, 0, 255), percentage / 10);
		return toBase64(graphics.stackImage([graphics.rect(frontColor), graphics.rect(backColor)]));
	} else {
		const frontColor = createColorBlock(combineRgb(0, 0, 255));
		const backColor = createColorBlock(combineRgb(0, 0, 0), percentage);
		return toBase64(graphics.stackImage([graphics.rect(frontColor), graphics.rect(backColor)]));
	}
}

export function drawThumb(thumb: string): string {
	const inputDecoded = PNG.sync.read(Buffer.from(thumb, 'base64'));
	const video = compositionState.get()!.video!;
	const out = ImageTransformer.fromBuffer(
		inputDecoded.data,
		inputDecoded.width,
		inputDecoded.height,
		PixelFormat.Rgba
	)
		.scale(inputDecoded.width, inputDecoded.width / video.width!.value! * video.height!.value!, ResizeMode.Fill)
		.scale(64, 64, ResizeMode.Fill)
		.toBufferSync(PixelFormat.Rgb);

	// @julusian/image-rs 1.1.1 returns a ComputedImage object whose `.buffer`
	// holds the raw pixel bytes. (0.2.x returned a Buffer directly — keep this
	// in mind if the dep is ever downgraded.)
	return out.buffer.toString('base64');
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
