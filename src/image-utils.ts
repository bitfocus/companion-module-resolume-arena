import {combineRgb} from '@companion-module/base';
import {graphics} from 'companion-module-utils';
import {PNG} from 'pngjs';
import {ImageTransformer, PixelFormat, ResizeMode} from '@julusian/image-rs';
import {compositionState} from './state';

export function drawPercentage(percentage: number): string | undefined {
	const optionsBlue = {
		width: 128,
		height: 128,
		color: combineRgb(255, 0, 0),
		rectWidth: 128,
		rectHeight: 128,
		strokeWidth: 0,
		opacity: 255,
		fillColor: combineRgb(0, 0, 255),
		fillOpacity: 255,
		offsetX: 0,
		offsetY: 0
	};

	const optionsBlack = {
		width: 128,
		height: 128,
		color: combineRgb(255, 0, 0),
		rectWidth: 128,
		rectHeight: 128 - 128 * percentage,
		strokeWidth: 0,
		opacity: 255,
		fillColor: combineRgb(0, 0, 0),
		fillOpacity: 255,
		offsetX: 0,
		offsetY: 0
	};

	return graphics.toPNG64({
		image: graphics.stackImage([graphics.rect(optionsBlue), graphics.rect(optionsBlack)]),
		width: 128,
		height: 128
	});
}

export function drawThumb(thumb: string): Uint8Array {
	const inputDecoded = PNG.sync.read(Buffer.from(thumb, 'base64'))
	const video = compositionState.get()!.video!;
	const out = ImageTransformer.fromBuffer(
		inputDecoded.data,
		inputDecoded.width,
		inputDecoded.height,
		PixelFormat.Rgba
	)
		.scale(inputDecoded.width, inputDecoded.width / video.width! * video.height!, ResizeMode.Fill)
		.scale(64, 64, ResizeMode.Fill)
		.toBufferSync(PixelFormat.Rgb)

	return out
}
