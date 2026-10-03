import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';

export function connectedColumnName(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {return {
	type: 'advanced',
	name: 'Connected Column Name',
	affectedProperties: ['text', 'color', 'bgcolor'],
	options: [],
	callback: resolumeArenaInstance.getColumnUtils()!.columnConnectedNameFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
}}
