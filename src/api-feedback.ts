import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from './index.js';
import {getClipApiFeedbacks} from './feedbacks/clip/clipFeedbacks.js';
import {getEffectApiFeedbacks} from './feedbacks/effect/effectFeedbacks.js';
import {getLayerGroupApiFeedbacks} from './feedbacks/layer-group/layerGroupFeedbacks.js';
import {getColumnApiFeedbacks} from './feedbacks/column/columnFeedbacks.js';
import {getCompositionApiFeedbacks} from './feedbacks/composition/compositionFeedbacks.js';
import {getDeckApiFeedbacks} from './feedbacks/deck/deckFeedbacks.js';
import {getLayerApiFeedbacks} from './feedbacks/layer/layerFeedbacks.js';

export function getApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		...getClipApiFeedbacks(resolumeArenaInstance),
		...getColumnApiFeedbacks(resolumeArenaInstance),
		...getCompositionApiFeedbacks(resolumeArenaInstance),
		...getDeckApiFeedbacks(resolumeArenaInstance),
		...getEffectApiFeedbacks(resolumeArenaInstance),
		...getLayerApiFeedbacks(resolumeArenaInstance),
		...getLayerGroupApiFeedbacks(resolumeArenaInstance),
	};
}
