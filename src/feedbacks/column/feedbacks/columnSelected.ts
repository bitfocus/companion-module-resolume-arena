import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getDefaultStyleGreen} from '../../../defaults';

export function columnSelected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Column Selected',
		defaultStyle: getDefaultStyleGreen(),
		options: [...getColumnOption()],
		callback: resolumeArenaInstance.getColumnUtils()!.columnSelectedFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
	};
}