import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function selectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Selected Column Name',
	options: [],
	callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}