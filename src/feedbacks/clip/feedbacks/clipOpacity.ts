import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getClipOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function clipOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Opacity',
		options: [...getClipOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	};
}