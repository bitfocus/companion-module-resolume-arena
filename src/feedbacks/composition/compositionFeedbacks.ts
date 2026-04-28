import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {tempo} from './feedbacks/tempo.js';
import {compositionOpacity} from './feedbacks/compositionOpacity.js';
import {compositionVolume} from './feedbacks/compositionVolume.js';
import {compositionMaster} from './feedbacks/compositionMaster.js';
import {compositionSpeed} from './feedbacks/compositionSpeed.js';

export function getCompositionApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		tempo: tempo(resolumeArenaInstance),
		compositionOpacity: compositionOpacity(resolumeArenaInstance),
		compositionVolume: compositionVolume(resolumeArenaInstance),
		compositionMaster: compositionMaster(resolumeArenaInstance),
		compositionSpeed: compositionSpeed(resolumeArenaInstance),
	};
}
