import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function compositionVolume(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'advanced',
		name: 'Composition Volume',
		affectedProperties: ['text', 'imageBuffer'],
		options: [],
		callback: resolumeArenaInstance.getCompositionUtils()!.compositionVolumeFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
	};
}