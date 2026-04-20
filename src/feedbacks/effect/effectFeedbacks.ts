import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypassed} from './feedbacks/effectBypassed';

export function getEffectApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		effectBypassed: effectBypassed(resolumeArenaInstance),
	};
}
