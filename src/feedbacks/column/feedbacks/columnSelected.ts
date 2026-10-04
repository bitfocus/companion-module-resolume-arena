import {ResolumeArenaModuleInstance} from '../../../index.js';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getDefaultStyleGreen} from '../../../defaults.js';

export function columnSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Column Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getColumnOption()],
		callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
	};
}