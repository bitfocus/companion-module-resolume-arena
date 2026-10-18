import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {effectBypass} from './actions/effect-bypass.js';
import {effectParameterSet} from './actions/effect-parameter-set.js';

export function getEffectActions(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	return {
		effectBypassLayer: effectBypass(resolumeArenaInstance, 'layer'),
		effectBypassClip: effectBypass(resolumeArenaInstance, 'clip'),
		effectBypassClipList: effectBypass(resolumeArenaInstance, 'clip', true),
		effectBypassGroup: effectBypass(resolumeArenaInstance, 'layergroup'),
		effectBypassComposition: effectBypass(resolumeArenaInstance, 'composition'),
		effectParameterSetLayer: effectParameterSet(resolumeArenaInstance, 'layer'),
		effectParameterSetClip: effectParameterSet(resolumeArenaInstance, 'clip'),
		effectParameterSetClipList: effectParameterSet(resolumeArenaInstance, 'clip', true),
		effectParameterSetGroup: effectParameterSet(resolumeArenaInstance, 'layergroup'),
		effectParameterSetComposition: effectParameterSet(resolumeArenaInstance, 'composition'),
	};
}
