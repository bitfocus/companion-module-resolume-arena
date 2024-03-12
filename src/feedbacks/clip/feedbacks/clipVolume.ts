import {ResolumeArenaModuleInstance} from '../../../index';
import {getClipOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function clipVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Volume',
		options: [...getClipOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		subscribe: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipVolumeFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	};
}