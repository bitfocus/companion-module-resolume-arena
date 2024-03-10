import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {columnSelected} from './feedbacks/columnSelected';
import {columnName} from './feedbacks/columnName';
import {selectedColumnName} from './feedbacks/selectedColumnName';
import {nextColumnName} from './feedbacks/nextColumnName';
import {previousColumnName} from './feedbacks/previousColumnName';

export function getColumnApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		columnSelected: columnSelected(resolumeArenaInstance),
		columnName: columnName(resolumeArenaInstance),
		selectedColumnName: selectedColumnName(resolumeArenaInstance),
		nextColumnName: nextColumnName(resolumeArenaInstance),
		previousColumnName: previousColumnName(resolumeArenaInstance),
	};
}
