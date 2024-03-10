import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {getClipApiFeedbacks} from './feedbacks/clip/clipFeedbacks';
import {getLayerGroupApiFeedbacks} from './feedbacks/layer-group/layerGroupFeedbacks';
import {getColumnApiFeedbacks} from './feedbacks/column/columnFeedbacks';
import {getCompositionApiFeedbacks} from './feedbacks/composition/compositionFeedbacks';
import {getDeckApiFeedbacks} from './feedbacks/deck/deckFeedbacks';
import {getLayerApiFeedbacks} from './feedbacks/layer/layerFeedbacks';

export function getApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		...getClipApiFeedbacks(resolumeArenaInstance),
		...getColumnApiFeedbacks(resolumeArenaInstance),
		...getCompositionApiFeedbacks(resolumeArenaInstance),
		...getDeckApiFeedbacks(resolumeArenaInstance),
		...getLayerApiFeedbacks(resolumeArenaInstance),
		...getLayerGroupApiFeedbacks(resolumeArenaInstance),
	};
}
