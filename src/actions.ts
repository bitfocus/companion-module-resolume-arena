import {CompanionActionDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {getClipActions} from './actions/clip/clipActions';
import {getColumnActions} from './actions/column/columnActions';
import {getCompositionActions} from './actions/composition/compositionActions';
import {getDeckActions} from './actions/deck/deckActions';
import {getLayerActions} from './actions/layer/layerActions';

export function getActions(resolumeArenaModuleInstance: ResolumeArenaModuleInstance): CompanionActionDefinitions {
	return {
		...getClipActions(resolumeArenaModuleInstance),
		...getColumnActions(resolumeArenaModuleInstance),
		...getCompositionActions(resolumeArenaModuleInstance),
		...getDeckActions(resolumeArenaModuleInstance),
		...getLayerActions(resolumeArenaModuleInstance),
	};
}
