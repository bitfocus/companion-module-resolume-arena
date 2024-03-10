import {getColumnOption, getLayerOption} from '../../../defaults';
import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedClip(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Connected Clip',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipConnectedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!)
	};
}
