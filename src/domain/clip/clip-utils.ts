import {combineRgb, CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {drawPercentage, drawThumb, drawVolume} from '../../image-utils';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {Clip, RangeParameter} from '../api';
import {ClipId} from './clip-id';

export class ClipUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private clipThumbs: Map<string, Uint8Array> = new Map<string, Uint8Array>();
	private clipBase64Thumbs: Map<string, string> = new Map<string, string>();
	private initalLoadDone = false;

	private clipDetailsSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipOpacitySubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipVolumeSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipSpeedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipSpeedIds: Set<number> = new Set<number>();
	private clipVolumeIds: Set<number> = new Set<number>();
	private clipOpacityIds: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ClipUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition || !this.initalLoadDone) {
			if (compositionState.get() !== undefined) {
				this.initalLoadDone = true;
				this.initComposition();
			}
		}
		if (isComposition){
			this.updateLayerVolumes();
			this.updateLayerOpacities();
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.resolumeArenaInstance.checkFeedbacks('connectedClip');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/select/)) {
				this.resolumeArenaInstance.checkFeedbacks('selectedClip');
				this.resolumeArenaInstance.checkFeedbacks('connectedClip');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/transport\/position\/behaviour\/speed/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipSpeed');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/video\/opacity/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipOpacity');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/audio\/volume/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipVolume');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/transport\/position/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipTransportPosition');
			}
		}
	}

	initComposition() {
		this.initDetailsFromComposition();
		this.initConnectedFromComposition();
		this.initSelectedFromComposition();
		this.initSpeedFromComposition();
	}

	initConnectedFromComposition() {
		const layers = compositionState.get()?.layers;
		if (layers) {
			for (const [layer, layerObject] of layers.entries()) {
				const clips = layerObject.clips;
				if (clips) {
					for (const [clip, clipObject] of clips.entries()) {
						const clipId = new ClipId(layer + 1, clip + 1);
						this.clipConnectedWebsocketUnsubscribe(clipId.getLayer(), clipId.getColumn());
						this.clipTransportPositionWebsocketUnsubscribe(clipObject.transport?.position?.id);

						this.clipConnectedWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
						this.clipTransportPositionWebsocketSubscribe(clipObject.transport?.position?.id);
					}
				}
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('connectedClip');
	}

	initSelectedFromComposition() {
		const layers = compositionState.get()?.layers;
		if (layers) {
			for (const [layer, layerObject] of layers.entries()) {
				const clips = layerObject.clips;
				if (clips) {
					for (const [clip, _clipObject] of clips.entries()) {
						const clipId = new ClipId(layer + 1, clip + 1);
						this.clipSelectedWebsocketUnsubscribe(clipId.getLayer(), clipId.getColumn());

						this.clipSelectedWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
					}
				}
			}
		}
		this.resolumeArenaInstance.checkFeedbacks('selectedClip');
	}

	async initDetailsFromComposition() {
		const thumbPromiseMap: Promise<void>[] = [];
		for (const clipDetailsSubscription of this.clipDetailsSubscriptions) {
			const clipId = ClipId.fromId(clipDetailsSubscription[0]);
			this.clipDetailsWebsocketUnsubscribe(clipId.getLayer(), clipId.getColumn());
			this.clipDetailsWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
			let thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
			if (thumb) {
				if (this.resolumeArenaInstance.getConfig().useCroppedThumbs) {
					thumbPromiseMap.push(this.getThumbs(clipId, clipDetailsSubscription[0]));
					this.resolumeArenaInstance.checkFeedbacks('clipInfo');
				} else {
					this.clipBase64Thumbs.set(clipId.getIdString(), thumb);
				}
			} else {
				this.resolumeArenaInstance.log('warn', 'thumb is not');
				return;
			}
		}
		if (thumbPromiseMap.length < 0) {
			Promise.allSettled(thumbPromiseMap).then(_ => {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
			});
		}

	}

	async getThumbs(clipId: ClipId, feedbackId: string) {
		let thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
		if (thumb) {
			this.clipThumbs.set(clipId.getIdString(), drawThumb(thumb));
			this.resolumeArenaInstance.checkFeedbacksById(feedbackId);
		} else {
			this.resolumeArenaInstance.log('warn', 'thumb is not');
			return;
		}
	}

	initSpeedFromComposition() {
		for (const clipSpeedId of this.clipSpeedIds) {
			this.clipSpeedWebsocketUnsubscribe(clipSpeedId);
		}
		for (const clipSpeedSubscription of this.clipSpeedSubscriptions) {
			const clipId = ClipId.fromId(clipSpeedSubscription[0]);
			this.clipSpeedWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
		}
		this.resolumeArenaInstance.checkFeedbacks('clipSpeed');
	}

	updateLayerVolumes() {
			for (const clipVolumeId of this.clipVolumeIds) {
				this.clipVolumeWebsocketUnsubscribe(clipVolumeId);
			}
			for (const [clipIdString, _subscriptionId] of this.clipVolumeSubscriptions.entries()) {
				let clipId = ClipId.fromId(clipIdString);
				this.clipVolumeWebsocketFeedbackSubscribe(clipId.getLayer(), clipId.getColumn())
			}
			this.resolumeArenaInstance.checkFeedbacks('clipVolume');
	}

	updateLayerOpacities() {
			for (const clipOpacityId of this.clipOpacityIds) {
				this.clipOpacityWebsocketUnsubscribe(clipOpacityId);
			}
			for (const [clipIdString, _subscriptionId] of this.clipOpacitySubscriptions.entries()) {
				let clipId = ClipId.fromId(clipIdString);
				this.clipOpacityWebsocketSubscribe(clipId.getLayer(), clipId.getColumn())
			}
			this.resolumeArenaInstance.checkFeedbacks('clipOpacity');
	}

	public getClipFromCompositionState(layer: number, column: number): Clip | undefined {
		const layersObject = compositionState.get()?.layers;
		if (layersObject) {
			const layerObject = layersObject[layer - 1];
			const clipsObject = layerObject.clips;
			if (clipsObject) {
				const clipObject = clipsObject[column - 1];
				return clipObject;
			}
		}
		return undefined;
	}


/////////////////////////////////////////////////
// Volume
/////////////////////////////////////////////////


	clipVolumeFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		const volume = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/audio/volume']?.value;
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100) / 100 + 'db',
				show_topbar: false,
				imageBuffer: drawVolume(volume, 12)
			};
		}
		return {text: '?'};
	}

	clipVolumeFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipVolumeSubscriptions.get(idString)) {
				this.clipVolumeSubscriptions.set(idString, new Set());
			}
			this.clipVolumeSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipVolumeFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			const clipVolumeSubscription = this.clipVolumeSubscriptions.get(idString);
			if (clipVolumeSubscription) {
				clipVolumeSubscription.delete(feedback.id);
				if (clipVolumeSubscription.size === 0) {
					this.clipVolumeSubscriptions.delete(idString);
				}
			}
		}
	}

	clipVolumeWebsocketFeedbackSubscribe(layer: number, column: number) {
		const clip = this.getClipFromCompositionState(layer, column);
		const clipVolumeId = clip?.audio?.volume?.id;
		if (clipVolumeId) {
			this.clipVolumeIds.add(clipVolumeId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(clipVolumeId!);
		}
	}

	clipVolumeWebsocketUnsubscribe(clipVolumeId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(clipVolumeId!);
	}


	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	clipOpacityFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		const opacity = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/video/opacity']?.value;
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(opacity)
			};
		}
		return {text: '?'};
	}


	clipOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipOpacitySubscriptions.get(idString)) {
				this.clipOpacitySubscriptions.set(idString, new Set());
			}
			this.clipOpacitySubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = feedback.options.layer as number;
		const column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			const clipOpacitySubscription = this.clipOpacitySubscriptions.get(idString);
			if (clipOpacitySubscription) {
				clipOpacitySubscription.delete(feedback.id);
				if (clipOpacitySubscription.size === 0) {
					this.clipOpacitySubscriptions.delete(idString);
				}
			}
		}
	}


	clipOpacityWebsocketSubscribe(layer: number, column: number) {
		const clip = this.getClipFromCompositionState(layer, column);
		const clipOpacityId = clip?.video?.opacity?.id;
		if (clipOpacityId) {
			this.clipOpacityIds.add(clipOpacityId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(clipOpacityId!);
		}
	}

	clipOpacityWebsocketUnsubscribe(clipOpacityId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(clipOpacityId!);
	}

	/////////////////////////////////////////////////
	// ClipDetails
	/////////////////////////////////////////////////

	clipDetailsFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			var key = new ClipId(layer, column);
			var result: CompanionAdvancedFeedbackResult = {
				text: '',
				png64: undefined
			};
			if (feedback.options.showName) {
				result.text = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/name']?.value;
			}
			if (feedback.options.showThumb) {
				if (this.resolumeArenaInstance.getConfig().useCroppedThumbs) {
					result.imageBuffer = this.clipThumbs.get(key.getIdString());
					result.imageBufferPosition = {
						x: 4,
						y: 4,
						width: 64,
						height: 64
					};
				} else {
					result.png64 = this.clipBase64Thumbs.get(key.getIdString());
				}
				result.show_topbar = false;
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
		this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
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
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	/////////////////////////////////////////////////
	// Connected
	/////////////////////////////////////////////////

	clipConnectedFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const connectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/connect']?.value;
		const selectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/select']?.value;
		// this.resolumeArenaInstance.log('debug', 'connectedState layer:' + layer + 'col: ' + column + ' connectedState:' + connectedState);
		switch (connectedState) {
			case 'Connected':
				if (selectedState) {
					return {bgcolor: combineRgb(100, 255, 255)};
				}
				return {bgcolor: combineRgb(0, 255, 0)};
			case 'Connected & previewing':
				return {bgcolor: combineRgb(0, 255, 255)};
			case 'Previewing':
				return {bgcolor: combineRgb(0, 0, 255)};
			default:
				return {bgcolor: combineRgb(0, 0, 0)};
		}
	}

	clipConnectedWebsocketSubscribe(layer: number, column: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
	}

	clipConnectedWebsocketUnsubscribe(layer: number, column: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
	}

	/////////////////////////////////////////////////
	// Selected
	/////////////////////////////////////////////////

	clipSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		return parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/select']?.value;
	}

	clipSelectedWebsocketSubscribe(layer: number, column: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/select');
	}

	clipSelectedWebsocketUnsubscribe(layer: number, column: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/select');
	}

	/////////////////////////////////////////////////
	// Speed
	/////////////////////////////////////////////////

	clipSpeedFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const speed = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/transport/position/behaviour/speed']?.value;
		if (ClipId.isValid(layer, column)) {
			return {
				text: Math.round(speed * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(speed)
			};
		}
		return {text: '?'};
	}

	clipSpeedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipSpeedSubscriptions.get(idString)) {
				this.clipSpeedSubscriptions.set(idString, new Set());
				this.clipSpeedWebsocketSubscribe(layer, column);
			}
			this.clipSpeedSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipSpeedWebsocketSubscribe(layer: number, column: number) {
		const clip = this.getClipFromCompositionState(layer, column);
		const clipSpeedId = clip?.transport?.controls?.speed?.id;
		if (clipSpeedId) {
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(clipSpeedId);
			this.clipSpeedIds.add(clipSpeedId);
		}
		// this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/speed');
	}

	clipSpeedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const clipSpeedSubscriptions = this.clipSpeedSubscriptions.get(new ClipId(layer, column).getIdString());
		if (ClipId.isValid(layer, column) && clipSpeedSubscriptions) {
			clipSpeedSubscriptions.delete(feedback.id);
			if (clipSpeedSubscriptions.size === 0) {
				const clip = this.getClipFromCompositionState(layer, column);
				const clipSpeedId = clip?.transport?.controls?.speed?.id;
				this.clipSpeedWebsocketUnsubscribe(clipSpeedId);
				this.clipSpeedSubscriptions.delete(new ClipId(layer, column).getIdString());
			}
		}
	}

	clipSpeedWebsocketUnsubscribe(clipSpeedId?: number) {
		if (clipSpeedId) {
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(clipSpeedId);
			this.clipSpeedIds.delete(clipSpeedId);
		}
		// this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/speed');
	}

	/////////////////////////////////////////////////
	// Transport Position
	/////////////////////////////////////////////////

	clipTransportPositionFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		var view = feedback.options.view;
		var timeRemaining = feedback.options.timeRemaining;
		const param = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/transport/position'] as RangeParameter;

		if (ClipId.isValid(layer, column) && view && param && param.max !== undefined && param.value !== undefined) {
			const max = param.max;
			const value = param.value;

			const subSecondsInSecond = 60;
			const secondsInMinute = 60;
			const minutesInHour = 60;
			const framesInMinute = subSecondsInSecond * secondsInMinute;
			const framesInHour = framesInMinute * minutesInHour;

			let time: number;

			if (timeRemaining) {
				time = ((max - value) / 100) * 6 + 0.6;
			} else {
				time = (value / 100) * 6;
			}

			var hours = Math.floor(Math.abs(time / framesInHour));
			var minutesOnly = Math.floor(Math.abs((time - hours * framesInHour) / framesInMinute));
			var secondsOnly = Math.floor(Math.abs((time - hours * framesInHour - minutesOnly * framesInMinute) / subSecondsInSecond));
			var subSecondsOnly = Math.floor(Math.abs(time - hours * framesInHour - minutesOnly * framesInMinute - secondsOnly * subSecondsInSecond));
			var framesOnly = Math.floor(subSecondsOnly / 2);

			switch (view) {
				case 'fullSeconds':
					return {text: (Math.round(value / 100) / 10).toFixed(1) + 's', size: 14};
				case 'frames':
					return {text: framesOnly.toString().padStart(2, '0')};
				case 'seconds':
					return {text: secondsOnly.toString().padStart(2, '0')};
				case 'minutes':
					return {text: minutesOnly.toString().padStart(2, '0')};
				case 'hours':
					return {text: hours.toString().padStart(2, '0')};
				case 'direction':
					return {text: timeRemaining ? '-' : '+'};
				case 'timestampFrame':
					return {
						text:
							(timeRemaining ? '-' : '') +
							hours.toString().padStart(2, '0') +
							':' +
							minutesOnly.toString().padStart(2, '0') +
							':' +
							secondsOnly.toString().padStart(2, '0') +
							': ' +
							framesOnly.toString().padStart(2, '0'),
						size: 14
					};
				case 'timestamp':
					return {
						text:
							(timeRemaining ? '-' : '') +
							hours.toString().padStart(2, '0') +
							':' +
							minutesOnly.toString().padStart(2, '0') +
							':' +
							secondsOnly.toString().padStart(2, '0'),
						size: 14
					};
				default:
					break;
			}
		}
		return {text: '?'};
	}

	clipTransportPositionWebsocketSubscribe(clipTransportPositionId?: number) {
		if (clipTransportPositionId) {
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(clipTransportPositionId);
		}
	}

	clipTransportPositionWebsocketUnsubscribe(clipTransportPositionId?: number) {
		if (clipTransportPositionId) {
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(clipTransportPositionId);
		}
	}
}
