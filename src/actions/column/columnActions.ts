import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {connectColumn} from './actions/connectColumn';
import {compNextCol} from '../composition/actions/comp-next-col';
import {compPrevCol} from '../composition/actions/comp-prev-col';
import {selectColumn} from './actions/selectColumn';

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
