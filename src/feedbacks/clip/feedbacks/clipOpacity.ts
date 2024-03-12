import {ResolumeArenaModuleInstance} from '../../../index';
import {getClipOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function clipOpacity(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Opacity',
		options: [...getClipOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		subscribe: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipOpacityFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	};
}