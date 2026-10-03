import {combineRgb} from '@companion-module/base';
import type {CompanionAdvancedFeedbackResult, CompanionFeedbackDefinition} from '@companion-module/base';
import {graphics} from 'companion-module-utils';
import type {OptionsBar} from 'companion-module-utils/dist/graphics.js';
import type {ResolumeArenaModuleInstance} from '../../../index.js';
import {encodeImageBuffer} from '../../../image-utils.js';

export function wsProgressBar(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'WS: Layer Progress Bar',
		affectedProperties: ['bgcolor', 'imageBuffer'],
		description: 'Visual progress bar for layer active clip playback. Green → Orange → Red based on remaining time.',
		options: [
			{
				id: 'layer',
				type: 'textinput',
				label: 'Layer',
				default: '1',
				useVariables: true,
			},
			{
				id: 'hideWhenNotRunning',
				type: 'checkbox',
				label: 'Hide when not running',
				default: true,
			},
			{
				id: 'orangeSeconds',
				type: 'textinput',
				label: 'Change to orange at remaining seconds',
				default: '30',
				useVariables: true,
			},
			{
				id: 'redSeconds',
				type: 'textinput',
				label: 'Change to red at remaining seconds',
				default: '10',
				useVariables: true,
			},
			{
				id: 'runningColor',
				type: 'colorpicker',
				label: 'Running color (green)',
				default: combineRgb(0, 200, 0),
				returnType: 'number',
			},
			{
				id: 'warningColor',
				type: 'colorpicker',
				label: 'Warning color (orange)',
				default: combineRgb(255, 140, 0),
				returnType: 'number',
			},
			{
				id: 'criticalColor',
				type: 'colorpicker',
				label: 'Critical color (red)',
				default: combineRgb(255, 0, 0),
				returnType: 'number',
			},
		],
		callback: async (feedback: any): Promise<CompanionAdvancedFeedbackResult> => {
			const layer = +feedback.options.layer;
			const column = resolumeArenaInstance.getLayerUtils()?.getActiveColumn(layer) ?? 0;

			if (column === 0) {
				return feedback.options.hideWhenNotRunning ? {} : { bgcolor: combineRgb(0, 0, 0) };
			}

			const timing = resolumeArenaInstance.getClipUtils()?.wsPositionToSeconds(layer, column);
			if (!timing || timing.totalSec === 0) {
				return feedback.options.hideWhenNotRunning ? {} : { bgcolor: combineRgb(0, 0, 0) };
			}

			const { elapsedSec, totalSec, remainingSec } = timing;

			const orangeThreshold = parseFloat(String(feedback.options.orangeSeconds ?? '30')) || 30;
			const redThreshold = parseFloat(String(feedback.options.redSeconds ?? '10')) || 10;

			let barColor: number;
			if (remainingSec <= redThreshold) {
				barColor = +feedback.options.criticalColor;
			} else if (remainingSec <= orangeThreshold) {
				barColor = +feedback.options.warningColor;
			} else {
				barColor = +feedback.options.runningColor;
			}

			const progressPercent = totalSec > 0 ? (elapsedSec / totalSec) * 100 : 0;

			const options: OptionsBar = {
				width: feedback.image!.width,
				height: feedback.image!.height,
				colors: [{ size: 100, color: barColor, background: barColor, backgroundOpacity: 64 }],
				barLength: 62,
				barWidth: 8,
				value: progressPercent,
				type: 'horizontal',
				offsetX: 5,
				offsetY: feedback.image!.height > 58 ? 62 : 48,
				opacity: 255,
			};

			return { imageBuffer: encodeImageBuffer(graphics.bar(options)) };
		},
	};
}
