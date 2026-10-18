import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function selectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Selected Column Name',
	affectedProperties: ['text', 'color', 'bgcolor'],
	options: [],
	callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}