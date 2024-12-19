import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {columnSelected} from './feedbacks/columnSelected';
import {columnName} from './feedbacks/columnName';
import {selectedColumnName} from './feedbacks/selectedColumnName';
import {nextSelectedColumnName} from './feedbacks/nextSelectedColumnName';
import {previousSelectedColumnName} from './feedbacks/previousSelectedColumnName';
import {columnConnected} from './feedbacks/columnConnected';
import {connectedColumnName} from './feedbacks/connectedColumnName';
import {nextConnectedColumnName} from './feedbacks/nextConnectedColumnName';
import {previousConnectedColumnName} from './feedbacks/previousConnectedColumnName';

export function getColumnApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		columnSelected: columnSelected(resolumeArenaInstance),
		columnConnected: columnConnected(resolumeArenaInstance),
		columnName: columnName(resolumeArenaInstance),
		selectedColumnName: selectedColumnName(resolumeArenaInstance),
		connectedColumnName: connectedColumnName(resolumeArenaInstance),
		nextSelectedColumnName: nextSelectedColumnName(resolumeArenaInstance),
		nextConnectedColumnName: nextConnectedColumnName(resolumeArenaInstance),
		previousSelectedColumnName: previousSelectedColumnName(resolumeArenaInstance),
		previousConnectedColumnName: previousConnectedColumnName(resolumeArenaInstance),
	};
}
