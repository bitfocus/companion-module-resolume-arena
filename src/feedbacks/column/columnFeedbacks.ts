import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {columnSelected} from './feedbacks/columnSelected.js';
import {columnName} from './feedbacks/columnName.js';
import {selectedColumnName} from './feedbacks/selectedColumnName.js';
import {nextSelectedColumnName} from './feedbacks/nextSelectedColumnName.js';
import {previousSelectedColumnName} from './feedbacks/previousSelectedColumnName.js';
import {columnConnected} from './feedbacks/columnConnected.js';
import {connectedColumnName} from './feedbacks/connectedColumnName.js';
import {nextConnectedColumnName} from './feedbacks/nextConnectedColumnName.js';
import {previousConnectedColumnName} from './feedbacks/previousConnectedColumnName.js';

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
