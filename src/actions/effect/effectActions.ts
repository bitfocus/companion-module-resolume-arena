import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypass} from './actions/effect-bypass';
import {effectParameterSet} from './actions/effect-parameter-set';

export function getEffectActions(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	return {
		effectBypass: effectBypass(resolumeArenaInstance),
		effectParameterSet: effectParameterSet(resolumeArenaInstance),
	};
}
