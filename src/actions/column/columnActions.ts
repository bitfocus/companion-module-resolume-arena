import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {triggerColumn} from './actions/trigger-column';
import {compNextCol} from '../composition/actions/comp-next-col';
import {compPrevCol} from '../composition/actions/comp-prev-col';

export function getColumnActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const restApi = resolumeArenaModuleInstance.getRestApi.bind(resolumeArenaModuleInstance);
	const websocketApi = resolumeArenaModuleInstance.getWebsocketApi.bind(resolumeArenaModuleInstance);
	const oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	const columnUtils = resolumeArenaModuleInstance.getColumnUtils.bind(resolumeArenaModuleInstance);
	return {
		triggerColumn: triggerColumn(restApi, websocketApi, oscApi, columnUtils),
		compNextCol: compNextCol(restApi, oscApi),
		compPrevCol: compPrevCol(restApi, oscApi),
	};
}
