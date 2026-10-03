import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption} from '../../../defaults.js';

export function columnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Column Name',
	options: [...getColumnOption()],
	callback: resolumeArenaInstance.getColumnUtils()!.columnNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}