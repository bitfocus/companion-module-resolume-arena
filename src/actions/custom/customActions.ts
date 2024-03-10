import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {customOscCommand} from './actions/custom-osc';

export function getCustomActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	var oscApi = resolumeArenaModuleInstance.getOscApi.bind(resolumeArenaModuleInstance);
	return {
		custom: customOscCommand(oscApi, resolumeArenaModuleInstance),
	};
}
