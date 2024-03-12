import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Next Column Name',
	options: [{
		id: 'next',
		type: 'number',
		label: 'Next',
		default: 1,
		min: 1,
		max: 65535
	}],
	callback: resolumeArenaInstance.getColumnUtils()!.columnNextNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}