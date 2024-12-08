import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function nextConnectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Next Connected Column Name',
	options: [{
		id: 'next',
		type: 'number',
		label: 'Next',
		default: 1,
		min: 1,
		max: 65535
	}],
	callback: resolumeArenaInstance.getColumnUtils()!.columnConnectedNextNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
