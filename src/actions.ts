import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {getClipActions} from './actions/clip/clipActions';
import {getColumnActions} from './actions/column/columnActions';
import {getCompositionActions} from './actions/composition/compositionActions';
import {getDeckActions} from './actions/deck/deckActions';
import {getEffectActions} from './actions/effect/effectActions';
import {getLayerActions} from './actions/layer/layerActions';
import {getLayerGroupActions} from './actions/layer-group/layerGroupActions';
import {getOscTransportActions} from './actions/osc-transport/oscTransportActions';

export function getActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const oscTransportActions = getOscTransportActions(
		resolumeArenaModuleInstance
	) as CompanionActionDefinitions;
	return {
		...getClipActions(resolumeArenaModuleInstance),
		...getColumnActions(resolumeArenaModuleInstance),
		...getCompositionActions(resolumeArenaModuleInstance),
		...getDeckActions(resolumeArenaModuleInstance),
		...getEffectActions(resolumeArenaModuleInstance),
		...getLayerActions(resolumeArenaModuleInstance),
		...getLayerGroupActions(resolumeArenaModuleInstance),
		...oscTransportActions,
	};
}
