import {getColumnOption, getDefaultConnectedClipColors, getLayerOption} from '../../../defaults.js';
import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedClip(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	const colors = getDefaultConnectedClipColors();
	return {
		type: 'advanced',
		name: 'Connected Clip',
		affectedProperties: ['bgcolor'],
		options: [...getLayerOption(), ...getColumnOption(),
			{
				id: 'color_connected',
				type: 'colorpicker',
				label: 'Connected',
				default: colors.color_connected,
				returnType: 'number'
			},
			{
				id: 'color_connected_selected',
				type: 'colorpicker',
				label: 'Connected & Selected',
				default: colors.color_connected_selected,
				returnType: 'number'
			},
			{
				id: 'color_connected_preview',
				type: 'colorpicker',
				label: 'Connected & previewing',
				default: colors.color_connected_preview,
				returnType: 'number'
			},
			{
				id: 'color_preview',
				type: 'colorpicker',
				label: 'previewing',
				default: colors.color_preview,
				returnType: 'number'
			}
		],
		callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	};
}
