import {CompanionFeedbackDefinitions} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index.js';
import {connectedClip} from './feedbacks/connectedClip.js';
import {selectedClip} from './feedbacks/selectedClip.js';
import {clipInfo} from './feedbacks/clipInfo.js';
import {clipSpeed} from './feedbacks/clipSpeed.js';
import {clipTransportPosition} from './feedbacks/clipTransportPosition.js';
import {clipOpacity} from './feedbacks/clipOpacity.js';
import {clipVolume} from './feedbacks/clipVolume.js';

export function getClipApiFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance): CompanionFeedbackDefinitions {
	return {
		connectedClip: connectedClip(resolumeArenaInstance),
		selectedClip: selectedClip(resolumeArenaInstance),
		clipInfo: clipInfo(resolumeArenaInstance),
		clipSpeed: clipSpeed(resolumeArenaInstance),
		clipTransportPosition: clipTransportPosition(resolumeArenaInstance),
		clipOpacity: clipOpacity(resolumeArenaInstance),
		clipVolume: clipVolume(resolumeArenaInstance)
	};
}

export function getOtherClipFeedbacks(resolumeArenaInstance: ResolumeArenaModuleInstance, currentFeedbackKey: string) {
	let feedbacks = Object.keys(getClipApiFeedbacks(resolumeArenaInstance));
	feedbacks.splice(feedbacks.indexOf(currentFeedbackKey),1);
	return feedbacks;
}
