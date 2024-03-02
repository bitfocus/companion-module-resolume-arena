import {Image, createCanvas, loadImage, CanvasRenderingContext2D, Canvas} from 'canvas';

export function drawPercentage(percentage: number): string | undefined {
	// Dimensions for the image
	const width = 72;
	const height = 72;

	// Instantiate the canvas object
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	if (percentage <= 1.01) {
		// Fill the rectangle with purple
		context.fillStyle = '#0000ff';
		context.fillRect(0, 72 - height * percentage, width, height);
	} else {
		context.fillStyle = '#0000ff';
		context.fillRect(0, 0, width, height);
		context.fillStyle = '#ff0000';
		context.fillRect(0, 72 - (height * percentage) / 10, width, height);
	}

	// Write the image to file
	const buffer = canvas.toBuffer('image/png');
	return buffer.toString('base64');
}

export async function drawThumb(thumb?: string): Promise<string | undefined> {
	// Dimensions for the image
	const width = 128;
	const height = 128;

	// Instantiate the canvas object
	if (!thumb) {
		throw 'Thumb is undefined';
	}

	const initialImage = await loadImage('data:image/png;base64,' + thumb);
	const image = removeImageBlanks(initialImage);
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');

	const toUseCanvasWidth = 118;
	const toUseCanvasHeight = 118;

	const destinationTop = 5;
	const destinationLeft = 5;
	const destinationWidth = toUseCanvasWidth;
	const destinationHeight = toUseCanvasHeight;

	if (image.width < 72 || image.height < 72) {
		return thumb;
	}

	drawImageProp(context, image, destinationLeft, destinationTop, destinationWidth, destinationHeight, 0.5, 0.5);

	const buffer = canvas.toBuffer('image/png');
	const base64Image = buffer.toString('base64');
	return base64Image;
}

function removeImageBlanks(imageObject: Image): Canvas {
	const imgWidth = imageObject.width;
	const imgHeight = imageObject.height;
	const canvas = new Canvas(imgWidth, imgHeight);
	canvas.width = imgWidth;
	canvas.height = imgHeight;
	var context = canvas.getContext('2d');
	context.drawImage(imageObject, 0, 0);
	const imageData = context.getImageData(0, 0, imgWidth, imgHeight);
	const data = imageData.data;

	var cropTop = scanY(true, imgWidth, imgHeight, data),
		cropBottom = scanY(false, imgWidth, imgHeight, data),
		cropLeft = scanX(true, imgWidth, imgHeight, data);
	const cropRight = scanX(false, imgWidth, imgHeight, data);
	if (cropLeft !== undefined && cropRight !== undefined && cropBottom != undefined && cropTop !== undefined) {
		const cropWidth = cropRight - cropLeft;
		const cropHeight = cropBottom - cropTop;

		canvas.width = cropWidth;
		canvas.height = cropHeight;
		canvas.getContext('2d').drawImage(imageObject, cropLeft, cropTop, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

		return canvas;
	} else {
		throw 'Image is fully transparent';
	}
}

function getRBGA(x: number, y: number, data: Uint8ClampedArray, imgWidth: number) {
	var offset = imgWidth * y + x;
	return {
		red: data[offset * 4],
		green: data[offset * 4 + 1],
		blue: data[offset * 4 + 2],
		opacity: data[offset * 4 + 3],
	};
}
function isTransparent(rgb: {red: any; green: any; blue: any; opacity?: any}) {
	return rgb.opacity < 0.1;
}
function scanY(fromTop: boolean, imgWidth: number, imgHeight: number, data: Uint8ClampedArray) {
	const stepSize = 20;
	var offset = fromTop ? stepSize : -1 * stepSize;

	// loop through each row
	for (var y = fromTop ? 0 : imgHeight - 1; fromTop ? y < imgHeight : y > -1; y += offset) {
		// loop through each column
		for (var x = 0; x < imgWidth; x += stepSize) {
			var rgba = getRBGA(x, y, data, imgWidth);
			if (!isTransparent(rgba)) {
				if (fromTop) {
					return y;
				} else {
					return Math.min(y + 1, imgHeight);
				}
			}
		}
	}
	return undefined; // all image is white
}
function scanX(fromLeft: boolean, imgWidth: number, imgHeight: number, data: Uint8ClampedArray) {
	const stepSize = 20;
	var offset = fromLeft ? stepSize : -1 * stepSize;

	// loop through each column
	for (var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? x < imgWidth : x > -1; x += offset) {
		// loop through each row
		for (var y = 0; y < imgHeight; y += stepSize) {
			var rgba = getRBGA(x, y, data, imgWidth);
			if (!isTransparent(rgba)) {
				if (fromLeft) {
					return x;
				} else {
					return Math.min(x + 1, imgWidth);
				}
			}
		}
	}
	return undefined; // all image is white
}

function drawImageProp(
	ctx: CanvasRenderingContext2D,
	img: Image | Canvas,
	x: number,
	y: number,
	w: number,
	h: number,
	offsetX: number,
	offsetY: number
) {
	if (arguments.length === 2) {
		x = y = 0;
		w = ctx.canvas.width;
		h = ctx.canvas.height;
	}

	// default offset is center
	offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
	offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

	// keep bounds [0.0, 1.0]
	if (offsetX < 0) offsetX = 0;
	if (offsetY < 0) offsetY = 0;
	if (offsetX > 1) offsetX = 1;
	if (offsetY > 1) offsetY = 1;

	var iw = img.width,
		ih = img.height,
		r = Math.min(w / iw, h / ih),
		nw = iw * r, // new prop. width
		nh = ih * r, // new prop. height
		cx,
		cy,
		cw,
		ch,
		ar = 1;

	// decide which gap to fill
	if (nw < w) ar = w / nw;
	if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
	nw *= ar;
	nh *= ar;

	// calc source rectangle
	cw = iw / (nw / w);
	ch = ih / (nh / h);

	cx = (iw - cw) * offsetX;
	cy = (ih - ch) * offsetY;

	// make sure source rectangle is valid
	if (cx < 0) cx = 0;
	if (cy < 0) cy = 0;
	if (cw > iw) cw = iw;
	if (ch > ih) ch = ih;

	// fill image in dest. rectangle
	ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
