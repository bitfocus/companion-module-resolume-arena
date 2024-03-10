import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {tempo} from './feedbacks/tempo';
import {compositionOpacity} from './feedbacks/compositionOpacity';
import {compositionVolume} from './feedbacks/compositionVolume';
import {compositionMaster} from './feedbacks/compositionMaster';
import {compositionSpeed} from './feedbacks/compositionSpeed';

export function getCompositionApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		tempo: tempo(resolumeArenaInstance),
		compositionOpacity: compositionOpacity(resolumeArenaInstance),
		compositionVolume: compositionVolume(resolumeArenaInstance),
		compositionMaster: compositionMaster(resolumeArenaInstance),
		compositionSpeed: compositionSpeed(resolumeArenaInstance),
	};
}
