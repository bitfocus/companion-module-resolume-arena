import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function tempo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Tempo',
	affectedProperties: ['text'],
	options: [],
	callback: resolumeArenaInstance.getCompositionUtils()!.compositionTempoFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
}}