import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, combineRgb} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {ClipId} from './clip-id';
import {drawPercentage} from '../../defaults';
import {Clip, RangeParameter} from '../api';

export class ClipUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private clipThumbs: Map<string, string> = new Map<string, string>();

	private clipDetailsSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipConnectedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipSpeedSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipSpeedIds: Set<number> = new Set<number>();
	private clipTransportPositionSubscriptions: Map<string, Set<string>> = new Map<string, Set<string>>();
	private clipTransportPositionIds: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ClipUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.initComposition();
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.resolumeArenaInstance.checkFeedbacks('connectedClip');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/transport\/position\/behaviour\/speed/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipSpeed');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/transport\/position/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipTransportPosition');
			}
		}
	}
	initComposition() {
		this.initConnectedFromComposition();
		this.initDetailsFromComposition();
		this.initSpeedFromComposition();
		this.initTransportPositionFromComposition();
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

	initTransportPositionFromComposition() {
		for (const clipTransportPositionId of this.clipTransportPositionIds) {
			this.clipTransportPositionWebsocketUnsubscribe(clipTransportPositionId);
		}
		for (const clipTransportPositionSubscription of this.clipTransportPositionSubscriptions) {
			const clipId = ClipId.fromId(clipTransportPositionSubscription[0]);
			this.clipTransportPositionWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
		}
		this.resolumeArenaInstance.checkFeedbacks('clipTransportPosition');
	}

	messageFilter() {
		return (message: any) => !!(message.path && message.path.match(/\/composition\/layers\/\d+\/clips\/\d+.*/));
	}

	public getClipFromCompositionState(layer: number, column: number): Clip | undefined {
		const layersObject = compositionState.get().layers;
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
		this.resolumeArenaInstance.log('debug', 'connectedState layer:' + layer + 'col: ' + column + ' connectedState:' + connectedState);
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
		this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
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
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
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
				png64: drawPercentage(speed),
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
		console.log('param', param);

		if (ClipId.isValid(layer, column) && view && param && param.max !== undefined && param.value !== undefined) {
			const max = param.max;
			const value = param.value;

			// const subSecondsInFrame = 2;
			const subSecondsInSecond = 60;
			const secondsInMinute = 60;
			const minutesInHour = 60;
			const framesInMinute = subSecondsInSecond * secondsInMinute;
			const framesInHour = framesInMinute * minutesInHour;

			/* const value = 0 * framesInHour + 6 * framesInMinute + 0 * subSecondsInSecond + 100; */
			// const value = 359926;

			let time: number;

			if (timeRemaining) {
				time = (((max - value) / 100) * 6)+0.6;
			} else {
				time = ((value / 100) * 6);
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
				case 'timestampFrame':
					return {text: (timeRemaining ? '-' : '') + hours.toString().padStart(2, '0') + ':' + minutesOnly.toString().padStart(2, '0') + ':' + secondsOnly.toString().padStart(2, '0') + '\: ' + framesOnly.toString().padStart(2, '0'), size: 14};
				case 'timestamp':
					return {text: (timeRemaining ? '-' : '') + hours.toString().padStart(2, '0') + ':' + minutesOnly.toString().padStart(2, '0') + ':' + secondsOnly.toString().padStart(2, '0'), size: 14};
				default:
					break;
			}
		}
		return {text: '?'};
	}

	clipTransportPositionFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipTransportPositionSubscriptions.get(idString)) {
				this.clipTransportPositionSubscriptions.set(idString, new Set());
				this.clipTransportPositionWebsocketSubscribe(layer, column);
			}
			this.clipTransportPositionSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	clipTransportPositionWebsocketSubscribe(layer: number, column: number) {
		const clip = this.getClipFromCompositionState(layer, column);
		const clipTransportPositionId = clip?.transport?.position?.id;
		if (clipTransportPositionId) {
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(clipTransportPositionId);
			this.clipTransportPositionIds.add(clipTransportPositionId);
		}
		// this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/speed');
	}

	clipTransportPositionFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		var column = feedback.options.column as number;
		const clipTransportPositionSubscriptions = this.clipTransportPositionSubscriptions.get(new ClipId(layer, column).getIdString());
		if (ClipId.isValid(layer, column) && clipTransportPositionSubscriptions) {
			clipTransportPositionSubscriptions.delete(feedback.id);
			if (clipTransportPositionSubscriptions.size === 0) {
				const clip = this.getClipFromCompositionState(layer, column);
				const clipTransportPositionId = clip?.transport?.position?.id;
				this.clipTransportPositionWebsocketUnsubscribe(clipTransportPositionId);
				this.clipTransportPositionSubscriptions.delete(new ClipId(layer, column).getIdString());
			}
		}
	}

	clipTransportPositionWebsocketUnsubscribe(clipTransportPositionId?: number) {
		if (clipTransportPositionId) {
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(clipTransportPositionId);
			this.clipTransportPositionIds.delete(clipTransportPositionId);
		}
		// this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/speed');
	}
}
