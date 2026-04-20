import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypass} from './actions/effect-bypass';

export function getEffectActions(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	return {
		effectBypass: effectBypass(resolumeArenaInstance),
	};
}
