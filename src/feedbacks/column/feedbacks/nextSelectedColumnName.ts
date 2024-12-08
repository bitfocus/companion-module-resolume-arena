import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextSelectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Next Selected Column Name',
	options: [{
		id: 'next',
		type: 'number',
		label: 'Next',
		default: 1,
		min: 1,
		max: 65535
	}],
	callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedNextNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
