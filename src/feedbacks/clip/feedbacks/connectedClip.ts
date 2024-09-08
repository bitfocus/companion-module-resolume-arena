import {getColumnOption, getLayerOption} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedClip(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Connected Clip',
		options: [...getLayerOption(), ...getColumnOption(),
			{
				id: 'color_connected',
				type: 'colorpicker',
				label: 'Connected',
				default: 'rgb(0, 255, 0)',
				returnType: 'number'
			},
			{
				id: 'color_connected_selected',
				type: 'colorpicker',
				label: 'Connected & Selected',
				default: 'rgb(255,0,255)',
				returnType: 'number'
			},
			{
				id: 'color_connected_preview',
				type: 'colorpicker',
				label: 'Connected & previewing',
				default: 'rgb(0, 255, 255)',
				returnType: 'number'
			},
			{
				id: 'color_preview',
				type: 'colorpicker',
				label: 'previewing',
				default: 'rgb(0, 0, 255)',
				returnType: 'number'
			}
		],
		callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	};
}
