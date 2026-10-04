import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from './index.js';
import {getClipActions} from './actions/clip/clipActions.js';
import {getColumnActions} from './actions/column/columnActions.js';
import {getCompositionActions} from './actions/composition/compositionActions.js';
import {getDeckActions} from './actions/deck/deckActions.js';
import {getEffectActions} from './actions/effect/effectActions.js';
import {getLayerActions} from './actions/layer/layerActions.js';
import {getLayerGroupActions} from './actions/layer-group/layerGroupActions.js';
import {getOscTransportActions} from './actions/osc-transport/oscTransportActions.js';

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
