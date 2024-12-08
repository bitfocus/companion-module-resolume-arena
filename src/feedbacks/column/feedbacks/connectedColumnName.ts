import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Connected Column Name',
	options: [],
	callback: resolumeArenaInstance.getColumnUtils()!.columnConnectedNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
