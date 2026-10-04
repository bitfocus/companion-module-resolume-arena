import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {connectColumn} from './actions/connectColumn.js';
import {compNextCol} from '../composition/actions/comp-next-col.js';
import {compPrevCol} from '../composition/actions/comp-prev-col.js';
import {selectColumn} from './actions/selectColumn.js';

export function getColumnActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const columnUtils = resolumeArenaModuleInstance.getColumnUtils.bind(resolumeArenaModuleInstance);
	return {
		connectColumn: connectColumn(restApi, websocketApi, oscApi, columnUtils, resolumeArenaModuleInstance),
		selectColumn: selectColumn(restApi, websocketApi, oscApi, columnUtils, resolumeArenaModuleInstance),
		compNextCol: compNextCol(restApi, oscApi),
		compPrevCol: compPrevCol(restApi, oscApi),
	};
}
