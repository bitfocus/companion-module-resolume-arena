import {ResolumeArenaModuleInstance} from '../../../index';
import {getColumnOption, getLayerOption} from '../../../defaults';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function clipSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Speed',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		subscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackSubscribe.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	};
}