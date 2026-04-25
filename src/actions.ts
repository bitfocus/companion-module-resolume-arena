import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from './index.js';
import {getClipActions} from './actions/clip/clipActions.js';
import {getColumnActions} from './actions/column/columnActions.js';
import {getCompositionActions} from './actions/composition/compositionActions.js';
import {getDeckActions} from './actions/deck/deckActions.js';
import {getLayerActions} from './actions/layer/layerActions.js';
import {getLayerGroupActions} from './actions/layer-group/layerGroupActions.js';
import {getEffectActions} from './actions/effect/effectActions.js';
import {getOscTransportActions} from './actions/osc-transport/oscTransportActions.js';

// Gate action groups on config toggles so users only see actions whose
// underlying transport is enabled. REST/WebSocket actions depend on
// config.useRest; OSC transport actions depend on config.useOscListener.
export function getActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const config: any = resolumeArenaModuleInstance.getConfig() ?? {};
	const actions: CompanionActionDefinitions = {};

	if (config.useRest) {
		Object.assign(actions,
			getClipActions(resolumeArenaModuleInstance),
			getColumnActions(resolumeArenaModuleInstance),
			getCompositionActions(resolumeArenaModuleInstance),
			getDeckActions(resolumeArenaModuleInstance),
			getEffectActions(resolumeArenaModuleInstance),
			getLayerActions(resolumeArenaModuleInstance),
			getLayerGroupActions(resolumeArenaModuleInstance),
		);
	}

	if (config.useOscListener) {
		Object.assign(actions, getOscTransportActions(resolumeArenaModuleInstance) as CompanionActionDefinitions);
	}

	return actions;
}
