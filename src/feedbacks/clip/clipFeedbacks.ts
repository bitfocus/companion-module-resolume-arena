import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {connectedClip} from './feedbacks/connectedClip';
import {selectedClip} from './feedbacks/selectedClip';
import {clipInfo} from './feedbacks/clipInfo';
import {clipSpeed} from './feedbacks/clipSpeed';
import {clipTransportPosition} from './feedbacks/clipTransportPosition';
import {clipOpacity} from './feedbacks/clipOpacity';
import {clipVolume} from './feedbacks/clipVolume';

export function getClipApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		connectedClip: connectedClip(resolumeArenaInstance),
		selectedClip: selectedClip(resolumeArenaInstance),
		clipInfo: clipInfo(resolumeArenaInstance),
		clipSpeed: clipSpeed(resolumeArenaInstance),
		clipTransportPosition: clipTransportPosition(resolumeArenaInstance),
		clipOpacity: clipOpacity(resolumeArenaInstance),
		clipVolume: clipVolume(resolumeArenaInstance),
	};
}
