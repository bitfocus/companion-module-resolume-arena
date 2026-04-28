import {ResolumeArenaModuleInstance} from '../../../index.js';
import {getColumnOption, getLayerOption} from '../../../defaults.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function clipSpeed(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Clip Speed',
		options: [...getLayerOption(), ...getColumnOption()],
		callback: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackCallback.bind(resolumeArenaInstance.getClipUtils()!),
		unsubscribe: resolumeArenaInstance.getClipUtils()!.clipSpeedFeedbackUnsubscribe.bind(resolumeArenaInstance.getClipUtils()!)
	} as any;
}