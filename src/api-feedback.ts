import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '.';
import {getClipApiFeedbacks} from './feedbacks/clip/clip';
import {getLayerGroupApiFeedbacks} from './feedbacks/layer-group/layer-group';
import {getColumnApiFeedbacks} from './feedbacks/column/column';
import {getCompositionApiFeedbacks} from './feedbacks/composition/composition';
import {getDeckApiFeedbacks} from './feedbacks/deck/deck';
import {getLayerApiFeedbacks} from './feedbacks/layer/layer';

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
