import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypassed} from './feedbacks/effectBypassed';
import {effectParameter} from './feedbacks/effectParameter';

export function getEffectApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		effectBypassedLayer: effectBypassed(resolumeArenaInstance, 'layer'),
		effectBypassedClip: effectBypassed(resolumeArenaInstance, 'clip'),
		effectBypassedGroup: effectBypassed(resolumeArenaInstance, 'layergroup'),
		effectBypassedComposition: effectBypassed(resolumeArenaInstance, 'composition'),
		effectParameterLayer: effectParameter(resolumeArenaInstance, 'layer'),
		effectParameterClip: effectParameter(resolumeArenaInstance, 'clip'),
		effectParameterGroup: effectParameter(resolumeArenaInstance, 'layergroup'),
		effectParameterComposition: effectParameter(resolumeArenaInstance, 'composition'),
	};
}
