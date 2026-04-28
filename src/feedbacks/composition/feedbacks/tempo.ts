import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function tempo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	const utils = resolumeArenaInstance.getCompositionUtils()!;
	return {
		type: 'advanced',
		name: 'Tempo',
		options: [],
		callback: utils.compositionTempoFeedbackCallback.bind(utils),
		unsubscribe: utils.compositionTempoFeedbackUnsubscribe.bind(utils),
	};
}