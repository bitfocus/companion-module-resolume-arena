import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function tempo(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Tempo',
	options: [],
	callback: resolumeArenaInstance.getCompositionUtils()!.compositionTempoFeedbackCallback.bind(resolumeArenaInstance.getCompositionUtils()!)
}}