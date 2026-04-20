import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {effectBypass} from './actions/effect-bypass';
import {effectParameterSet} from './actions/effect-parameter-set';

export function getEffectActions(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	return {
		effectBypassLayer: effectBypass(resolumeArenaInstance, 'layer'),
		effectBypassClip: effectBypass(resolumeArenaInstance, 'clip'),
		effectBypassGroup: effectBypass(resolumeArenaInstance, 'layergroup'),
		effectBypassComposition: effectBypass(resolumeArenaInstance, 'composition'),
		effectParameterSetLayer: effectParameterSet(resolumeArenaInstance, 'layer'),
		effectParameterSetClip: effectParameterSet(resolumeArenaInstance, 'clip'),
		effectParameterSetGroup: effectParameterSet(resolumeArenaInstance, 'layergroup'),
		effectParameterSetComposition: effectParameterSet(resolumeArenaInstance, 'composition'),
	};
}
