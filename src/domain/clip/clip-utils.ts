import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {ClipId} from './clip-id';

export class ClipUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private clipThumbs: Map<string, string> = new Map<string, string>();

	private clipDetailsSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipConnectedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ClipUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.initComposition();
		}
		if (data.path) {
			console.log('test', data.path);
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.resolumeArenaInstance.checkFeedbacks('connectedClip');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
			}
		}
	}
	initComposition() {
		this.initConnectedFromComposition();
		this.initDetailsFromComposition();
	}

	initConnectedFromComposition() {
		for (const clipConnectedSubscription of this.clipConnectedSubscriptions) {
			const clipId = ClipId.fromId(clipConnectedSubscription[0]);
			this.clipConnectedWebsocketUnsubscribe(clipId.getLayer(), clipId.getColumn());
			this.clipConnectedWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
		}
		this.resolumeArenaInstance.checkFeedbacks('connectedClip');
	}

	async initDetailsFromComposition() {
		for (const clipDetailsSubscription of this.clipDetailsSubscriptions) {
			const clipId = ClipId.fromId(clipDetailsSubscription[0]);
			this.clipDetailsWebsocketUnsubscribe(clipId.getLayer(), clipId.getColumn());
			this.clipDetailsWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
			var thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
			this.clipThumbs.set(clipId.getIdString(), thumb ?? '');
		}
		this.resolumeArenaInstance.checkFeedbacks('clipInfo');
	}

	messageFilter() {
		return (message: any) => !!(message.path && message.path.match(/\/composition\/layers\/\d+\/clips\/\d+.*/));
	}

	/////////////////////////////////////////////////
	// ClipDetails
	/////////////////////////////////////////////////

	clipDetailsFeedbackCallback(feedback: CompanionFeedbackInfo): {text: string | undefined; png64?: string | undefined} {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			var key = new ClipId(layer, column);
			var result: {
				text: string | undefined;
				png64: string | undefined;
			} = {
				text: '',
				png64: undefined,
			};
			if (feedback.options.showName) {
				result.text = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/name']?.value;
			}
			if (feedback.options.showThumb) {
				result.png64 = this.clipThumbs.get(key.getIdString());
			}
			return result;
		}
		return {text: undefined, png64: undefined};
	}

	clipDetailsFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipDetailsSubscriptions.get(idString)) {
				this.clipDetailsSubscriptions.set(idString, new Set());
				this.clipDetailsWebsocketSubscribe(layer, column);
			}
			this.clipDetailsSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipDetailsWebsocketSubscribe(layer: number, column: number) {
		this.resolumeArenaInstance
			.getWebsocketApi()
			?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	clipDetailsFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const clipDetailsSubscriptions = this.clipDetailsSubscriptions.get(new ClipId(layer, column).getIdString());
		if (ClipId.isValid(layer, column) && clipDetailsSubscriptions) {
			clipDetailsSubscriptions.delete(feedback.id);
			if (clipDetailsSubscriptions.size === 0) {
				this.clipDetailsWebsocketUnsubscribe(layer, column);
				this.clipDetailsSubscriptions.delete(new ClipId(layer, column).getIdString());
			}
		}
	}

	clipDetailsWebsocketUnsubscribe(layer: number, column: number) {
		this.resolumeArenaInstance
			.getWebsocketApi()
			?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	/////////////////////////////////////////////////
	// Connected
	/////////////////////////////////////////////////

	clipConnectedFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const connectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/connect']?.value
		console.log('connectedState', layer, column, connectedState)
		switch (connectedState) {
			case 'Connected':
				return {bgcolor: combineRgb(0, 255, 0)};
			case 'Connected & previewing':
				return {bgcolor: combineRgb(0, 255, 255)};
			case 'Previewing':
				return {bgcolor: combineRgb(0, 0, 255)};
			default:
				return {bgcolor: combineRgb(0, 0, 0)};
		}
	}

	clipConnectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipConnectedSubscriptions.get(idString)) {
				this.clipConnectedSubscriptions.set(idString, new Set());
				this.clipConnectedWebsocketSubscribe(layer, column);
			}
			this.clipConnectedSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipConnectedWebsocketSubscribe(layer: number, column: number) {
		this.resolumeArenaInstance
			.getWebsocketApi()
			?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
	}

	clipConnectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const clipConnectedSubscriptions = this.clipConnectedSubscriptions.get(new ClipId(layer, column).getIdString());
		if (ClipId.isValid(layer, column) && clipConnectedSubscriptions) {
			clipConnectedSubscriptions.delete(feedback.id);
			if (clipConnectedSubscriptions.size === 0) {
				this.clipConnectedWebsocketUnsubscribe(layer, column);
				this.clipConnectedSubscriptions.delete(new ClipId(layer, column).getIdString());
			}
		}
	}

	clipConnectedWebsocketUnsubscribe(layer: number, column: number) {
		this.resolumeArenaInstance
			.getWebsocketApi()
			?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
	}
}
