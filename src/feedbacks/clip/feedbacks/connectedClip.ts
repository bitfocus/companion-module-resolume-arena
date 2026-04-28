import {getColumnOption, getLayerOption} from '../../../defaults.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition, combineRgb} from '@companion-module/base';

export function connectedClip(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Connected Clip',
		options: [...getLayerOption(), ...getColumnOption(),
			// Numeric defaults — `returnType: 'number'` requires the option
			// value to be a number. The legacy `'rgb(r,g,b)'` string defaults
			// produced a string at the callback in Companion 4.3, which the
			// renderer silently dropped (no color rendered).
			{
				id: 'color_connected',
				type: 'colorpicker',
				label: 'Connected',
				default: combineRgb(0, 255, 0),
				returnType: 'number'
			},
			{
				id: 'color_connected_selected',
				type: 'colorpicker',
				label: 'Connected & Selected',
				default: combineRgb(0, 255, 255),
				returnType: 'number'
			},
			{
				id: 'color_connected_preview',
				type: 'colorpicker',
				label: 'Connected & previewing',
				default: combineRgb(255, 255, 0),
				returnType: 'number'
			},
			{
				id: 'color_preview',
				type: 'colorpicker',
				label: 'previewing',
				default: combineRgb(255, 0, 0),
				returnType: 'number'
			}
		],
		callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	};
}
