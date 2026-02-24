import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {getClipActions} from './actions/clip/clipActions';
import {getColumnActions} from './actions/column/columnActions';
import {getCompositionActions} from './actions/composition/compositionActions';
import {getDeckActions} from './actions/deck/deckActions';
import {getLayerActions} from './actions/layer/layerActions';
import {getLayerGroupActions} from './actions/layer-group/layerGroupActions';
import {getCustomActions} from './actions/custom/customActions';
import {getOscTransportActions} from './actions/osc-transport/oscTransportActions';

export function getActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	const enableOscTransport = !!resolumeArenaModuleInstance.getConfig()?.useOscListener;
	const oscTransportActions = (enableOscTransport
		? getOscTransportActions(resolumeArenaModuleInstance)
		: {}) as CompanionActionDefinitions;
	return {
		...getClipActions(resolumeArenaModuleInstance),
		...getColumnActions(resolumeArenaModuleInstance),
		...getCompositionActions(resolumeArenaModuleInstance),
		...getDeckActions(resolumeArenaModuleInstance),
		...getLayerActions(resolumeArenaModuleInstance),
		...getLayerGroupActions(resolumeArenaModuleInstance),
		...getCustomActions(resolumeArenaModuleInstance),
		...oscTransportActions,
	};
}
