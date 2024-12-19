import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function previousSelectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Previous Selected Column Name',
	options: [{
		id: 'previous',
		type: 'number',
		label: 'Previous',
		default: 1,
		min: 1,
		max: 65535
	}],
	callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
