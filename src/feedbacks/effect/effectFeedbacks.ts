import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypassed} from './feedbacks/effectBypassed';
import {effectParameter} from './feedbacks/effectParameter';

export function getEffectApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		effectBypassed: effectBypassed(resolumeArenaInstance),
		effectParameter: effectParameter(resolumeArenaInstance),
	};
}
