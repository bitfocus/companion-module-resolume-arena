import {getColumnOption, getDefaultStyleBlue, getLayerOption} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function selectedClip(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition{
	return {
		type: 'boolean',
		name: 'Selected Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		defaultStyle: getDefaultStyleBlue(),
		callback: resolumeArenaInstance.getClipUtils()!.clipSelectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	}
}