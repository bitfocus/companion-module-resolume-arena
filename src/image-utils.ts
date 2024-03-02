import {combineRgb} from '@companion-module/base';
import {graphics} from 'companion-module-utils';

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
		offsetY: 0,
	};

	const optionsBlack = {
		width: 128,
		height: 128,
		color: combineRgb(255, 0, 0),
		rectWidth: 128,
		rectHeight: 128 -(128 * percentage),
		strokeWidth: 0,
		opacity: 255,
		fillColor: combineRgb(0, 0, 0),
		fillOpacity: 255,
		offsetX: 0,
		offsetY: 0,
	};

	return graphics.toPNG64({image: graphics.stackImage([graphics.rect(optionsBlue), graphics.rect(optionsBlack)]), width: 128, height: 128})
}



export async function drawThumb(thumb?: string): Promise<string | undefined> {
	// console.log(thumb)

	const png64 = thumb!;
	const icon = await graphics.parseBase64(png64, {alpha: false});

	const imageBuffer = graphics.icon({
		width: 320,
		height: 240,
		offsetX: 0,
		offsetY: 0,
		type: 'custom',
		custom: icon,
		customWidth: 128,
		customHeight: 128,
	});

	return graphics.toPNG64({image: imageBuffer, width:128, height:128})

}
