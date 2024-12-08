import {ResolumeArenaModuleInstance} from '../../../index';
import {CompanionFeedbackDefinition} from '@companion-module/base';
import {getColumnOption, getDefaultStyleCyan} from '../../../defaults';

export function columnConnected(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinition {
	return {
		type: 'boolean',
		name: 'Column Connected',
		defaultStyle: getDefaultStyleCyan(),
		options: [...getColumnOption()],
		callback: resolumeArenaInstance.getColumnUtils()!.columnConnectedFeedbackCallback.bind(resolumeArenaInstance.getColumnUtils()!)
	};
}
