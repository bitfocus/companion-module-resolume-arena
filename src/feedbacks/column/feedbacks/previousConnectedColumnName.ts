import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function previousConnectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Previous Connected Column Name',
	options: [{
		id: 'previous',
		type: 'number',
		label: 'Previous',
		default: 1,
		min: 1,
		max: 65535
	}],
	callback: resolumeArenaInstance.getColumnUtils()!.columnConnectedPreviousNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
