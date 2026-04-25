import {combineRgb, CompanionAdvancedFeedbackResult, CompanionFeedbackInfo, CompanionVariableDefinition} from '@companion-module/base';
import {drawPercentage, drawThumb, drawVolume} from '../../image-utils';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {Clip, RangeParameter} from '../api';
import {ClipId} from './clip-id';
import {getOtherClipFeedbacks} from '../../feedbacks/clip/clipFeedbacks';
import {CompanionCommonCallbackContext} from '@companion-module/base/dist/module-api/common';
import {getLayerApiFeedbacks} from '../../feedbacks/layer/layerFeedbacks';

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

	private clipNameSubscribedPaths: Set<string> = new Set<string>();
	private clipNameLayerCount = 0;
	private clipNameColumnCount = 0;


	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'ClipUtils constructor called');
	}

	messageUpdates(data: {path: string; value: string | number | boolean}, isComposition: boolean) {
		if (isComposition || !this.initalLoadDone) {
			if (compositionState.get() !== undefined) {
				this.initalLoadDone = true;
				this.initComposition();
			}
		}
		if (isComposition) {
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
				if (data.value === true) {
					let match = data.path.match(/\/composition\/layers\/(\d+)\/clips\/(\d+)\/select/)!;
					let layer = match[1];
					let column = match[2];
					this.resolumeArenaInstance.setVariableValues({selectedClip: JSON.stringify({layer, column})});
					this.resolumeArenaInstance.setVariableValues({selectedClipLayer: layer});
					this.resolumeArenaInstance.setVariableValues({selectedClipColumn: column});
				}
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/name/)) {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
				const nameMatch = data.path.match(/\/composition\/layers\/(\d+)\/clips\/(\d+)\/name/);
				if (nameMatch) {
					this.resolumeArenaInstance.setVariableValues({
						[`clip_name_l${nameMatch[1]}_c${nameMatch[2]}`]: data.value as string
					});
				}
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
				const posMatch = data.path.match(/^\/composition\/layers\/(\d+)\/clips\/(\d+)\/transport\/position$/);
				if (posMatch) {
					this.updateWsLayerTimingVariables(+posMatch[1], +posMatch[2]);
				}
			}
		}
	}

	initComposition() {
		this.initDetailsFromComposition();
		this.initConnectedFromComposition();
		this.initSelectedFromComposition();
		this.initSpeedFromComposition();
		this.initClipNameVariables();
	}

	private initClipNameVariables() {
		const layers = compositionState.get()?.layers;
		if (!layers) return;

		for (const path of this.clipNameSubscribedPaths) {
			this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath(path);
		}
		this.clipNameSubscribedPaths.clear();

		this.clipNameLayerCount = layers.length;
		this.clipNameColumnCount = layers.reduce((max, layer) => Math.max(max, layer.clips?.length ?? 0), 0);

		const values: Record<string, string> = {};
		for (const [layerIdx, layerObject] of layers.entries()) {
			const layer = layerIdx + 1;
			const clips = layerObject.clips;
			if (!clips) continue;
			for (const [clipIdx, clipObject] of clips.entries()) {
				const column = clipIdx + 1;
				const path = `/composition/layers/${layer}/clips/${column}/name`;
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath(path);
				this.clipNameSubscribedPaths.add(path);
				values[`clip_name_l${layer}_c${column}`] = clipObject.name?.value ?? '';
			}
		}

		this.resolumeArenaInstance.setupVariables();
		this.resolumeArenaInstance.setVariableValues(values);
	}

	public getClipNameVariableDefinitions(): CompanionVariableDefinition[] {
		const defs: CompanionVariableDefinition[] = [];
		for (let layer = 1; layer <= this.clipNameLayerCount; layer++) {
			for (let column = 1; column <= this.clipNameColumnCount; column++) {
				defs.push({
					variableId: `clip_name_l${layer}_c${column}`,
					name: `Clip name Layer ${layer} Column ${column}`
				});
			}
		}
		return defs;
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
				this.resolumeArenaInstance.log('warn', 'thumb is not available for ' + clipId.getIdString());
			}
		}
		if (thumbPromiseMap.length > 0) {
			Promise.allSettled(thumbPromiseMap).then(_ => {
				this.resolumeArenaInstance.checkFeedbacks('clipInfo');
			});
		}

	}

	async getThumbs(clipId: ClipId, feedbackId: string) {
		let thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
		if (thumb) {
			try {
				this.clipThumbs.set(clipId.getIdString(), drawThumb(thumb));
				this.resolumeArenaInstance.checkFeedbacksById(feedbackId);
			} catch (e) {
				this.resolumeArenaInstance.log('warn', 'could not draw thumb: ' + e);
			}
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
			this.clipVolumeWebsocketFeedbackSubscribe(clipId.getLayer(), clipId.getColumn());
		}
		this.resolumeArenaInstance.checkFeedbacks('clipVolume');
	}

	updateLayerOpacities() {
		for (const clipOpacityId of this.clipOpacityIds) {
			this.clipOpacityWebsocketUnsubscribe(clipOpacityId);
		}
		for (const [clipIdString, _subscriptionId] of this.clipOpacitySubscriptions.entries()) {
			let clipId = ClipId.fromId(clipIdString);
			this.clipOpacityWebsocketSubscribe(clipId.getLayer(), clipId.getColumn());
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


	async clipVolumeFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (layer === 0 || column === 0) {
			return {text: '?'};
		}
		const volume = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/audio/volume']?.value;
		if (volume !== undefined) {
			return this.setVolumeFeedback(volume);
		} else {
			const fallbackVolume = (await this.resolumeArenaInstance.restApi!.Clips.getStatus(new ClipId(layer, column))).audio?.volume?.value;
			return this.setVolumeFeedback(fallbackVolume);
		}
	}

	private setVolumeFeedback(volume: number | undefined) {
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100) / 100 + 'db',
				show_topbar: false,
				imageBuffer: drawVolume(volume, 12)
			};
		} else {
			return {text: '?'};
		}
	}

	async clipVolumeFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipVolumeSubscriptions.get(idString)) {
				this.clipVolumeSubscriptions.set(idString, new Set());
			}
			this.clipVolumeSubscriptions.get(idString)?.add(feedback.id);
		}
	}

	async clipVolumeFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
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

	async clipOpacityFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (layer === 0 || column === 0) {
			return {text: '?'};
		}
		const opacity: number | undefined = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/video/opacity']?.value;

		if (opacity !== undefined) {
			return this.setOpacityFeedback(opacity);
		} else {
			const fallbackOpacity = (await this.resolumeArenaInstance.restApi!.Clips.getStatus(new ClipId(layer, column))).video?.opacity.value;
			return this.setOpacityFeedback(fallbackOpacity);
		}
	}


	private setOpacityFeedback(opacity: number | undefined) {
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(opacity)
			};
		} else {
			return {text: '?'};
		}
	}

	async clipOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (ClipId.isValid(layer, column)) {
			const idString = new ClipId(layer, column).getIdString();
			if (!this.clipOpacitySubscriptions.get(idString)) {
				this.clipOpacitySubscriptions.set(idString, new Set());
			}
			this.clipOpacitySubscriptions.get(idString)?.add(feedback.id);
		}
	}

	async clipOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
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

	async clipDetailsFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

		if (ClipId.isValid(layer, column)) {
			var key = new ClipId(layer, column);
			var result: CompanionAdvancedFeedbackResult = {
				text: '',
				png64: undefined
			};
			if (feedback.options.showName) {
				result.text = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/name']?.value;
			}
			if (feedback.options.showText) {
				let clipStatus = await this.resolumeArenaInstance.restApi?.Clips.getStatus(key);
				result.text = clipStatus?.video?.sourceparams?.Text?.value;
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

	async clipDetailsFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

		if (ClipId.isValid(layer, column)) {
			const clipId = new ClipId(layer, column);
			const idString = clipId.getIdString();
			const isNewClip = !this.clipDetailsSubscriptions.get(idString);
			if (isNewClip) {
				this.clipDetailsSubscriptions.set(idString, new Set());
				this.clipDetailsWebsocketSubscribe(layer, column);
			}
			this.clipDetailsSubscriptions.get(idString)?.add(feedback.id);

			// Composition already loaded before this subscription arrived — fetch the thumb now.
			if (isNewClip && this.initalLoadDone) {
				const thumb = await this.resolumeArenaInstance.restApi?.Clips.getThumb(clipId);
				if (thumb) {
					if (this.resolumeArenaInstance.getConfig().useCroppedThumbs) {
						await this.getThumbs(clipId, feedback.id);
					} else {
						this.clipBase64Thumbs.set(idString, thumb);
						this.resolumeArenaInstance.checkFeedbacks('clipInfo');
					}
				}
			}
		}
	}

	clipDetailsWebsocketSubscribe(layer: number, column: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	async clipDetailsFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

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

	async clipConnectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

		const connectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/connect']?.value;
		const selectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/select']?.value;
		// this.resolumeArenaInstance.log('debug', 'connectedState layer:' + layer + 'col: ' + column + ' connectedState:' + connectedState);

		const clipName = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/name']?.value;

		if ((connectedState as string)?.toLowerCase().includes('preview')) {
			this.resolumeArenaInstance.setVariableValues({previewedClip: JSON.stringify({layer, column, clipName})});
			this.resolumeArenaInstance.setVariableValues({previewedClipLayer: layer});
			this.resolumeArenaInstance.setVariableValues({previewedClipColumn: column});
			this.resolumeArenaInstance.setVariableValues({previewedClipName: clipName});
			this.resolumeArenaInstance.checkFeedbacks(...getOtherClipFeedbacks(this.resolumeArenaInstance, 'connectedClip'));
		}

		switch (connectedState) {
			case 'Connected':
				if (selectedState) {
					return {bgcolor: feedback.options.color_connected_selected as number};
				}
				return {bgcolor: feedback.options.color_connected as number};
			case 'Connected & previewing':
				return {bgcolor: feedback.options.color_connected_preview as number};
			case 'Previewing':

				return {bgcolor: feedback.options.color_preview as number};
			default:
				return {bgcolor: combineRgb(0, 0, 0)};
		}
	}

	clipConnectedWebsocketSubscribe(layer: number, column: number) {
		const ws = this.resolumeArenaInstance.getWebsocketApi();
		ws?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
		ws?.subscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	clipConnectedWebsocketUnsubscribe(layer: number, column: number) {
		const ws = this.resolumeArenaInstance.getWebsocketApi();
		ws?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/connect');
		ws?.unsubscribePath('/composition/layers/' + layer + '/clips/' + column + '/name');
	}

	/////////////////////////////////////////////////
	// Selected
	/////////////////////////////////////////////////

	async clipSelectedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<boolean> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

		let value = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/select']?.value;
		if (value) {
			const clipName = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/name']?.value;
			this.resolumeArenaInstance.setVariableValues({selectedClip: JSON.stringify({layer, column, clipName})});
			this.resolumeArenaInstance.setVariableValues({selectedClipLayer: layer});
			this.resolumeArenaInstance.setVariableValues({selectedClipColumn: column});
			this.resolumeArenaInstance.setVariableValues({selectedClipName: clipName});
			this.resolumeArenaInstance.checkFeedbacks(...getOtherClipFeedbacks(this.resolumeArenaInstance, 'selectedClip'), ...Object.keys(getLayerApiFeedbacks(this.resolumeArenaInstance)));
		}
		return value;
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

	async clipSpeedFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);
		if (layer === 0 || column === 0) {
			return {text: '?'};
		}
		const speed = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/transport/position/behaviour/speed']?.value;

		if (speed !== undefined) {
			return this.setSpeedFeedback(speed, layer, column);
		} else {
			const fallbackSpeed: number | undefined = (await this.resolumeArenaInstance.restApi!.Clips.getStatus(new ClipId(layer, column))).transport?.controls?.speed?.value;
			return this.setSpeedFeedback(fallbackSpeed, layer, column);
		}
	}

	private setSpeedFeedback(speed: number | undefined, layer: number, column: number) {
		if (speed !== undefined) {
			if (ClipId.isValid(layer, column)) {
				return {
					text: Math.round(speed * 100) + '%',
					show_topbar: false,
					imageBuffer: drawPercentage(speed)
				};
			}
		}
		return {text: '?'};
	}

	async clipSpeedFeedbackSubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

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

	async clipSpeedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext) {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

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

	async clipTransportPositionFeedbackCallback(feedback: CompanionFeedbackInfo, context: CompanionCommonCallbackContext): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await context.parseVariablesInString(feedback.options.layer as string);
		const column = +await context.parseVariablesInString(feedback.options.column as string);

		var view = feedback.options.view;
		var timeRemaining = feedback.options.timeRemaining;
		const timing = ClipId.isValid(layer, column) && view ? this.wsPositionToSeconds(layer, column) : null;

		if (timing) {
			const { elapsedSec, remainingSec } = timing;
			const displaySec = timeRemaining ? remainingSec : elapsedSec;

			const subSecondsInSecond = 60;
			const secondsInMinute = 60;
			const minutesInHour = 60;
			const framesInMinute = subSecondsInSecond * secondsInMinute;
			const framesInHour = framesInMinute * minutesInHour;

			const time = displaySec * subSecondsInSecond;
			var hours = Math.floor(Math.abs(time / framesInHour));
			var minutesOnly = Math.floor(Math.abs((time - hours * framesInHour) / framesInMinute));
			var secondsOnly = Math.floor(Math.abs((time - hours * framesInHour - minutesOnly * framesInMinute) / subSecondsInSecond));
			var subSecondsOnly = Math.floor(Math.abs(time - hours * framesInHour - minutesOnly * framesInMinute - secondsOnly * subSecondsInSecond));
			var framesOnly = Math.floor(subSecondsOnly / 2);

			switch (view) {
				case 'fullSeconds':
					return {text: displaySec.toFixed(1) + 's', size: 14};
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
				case 'timestampFrame_noHours':
					return {
						text:
							(timeRemaining ? '-' : '') +
							((hours * 60) + minutesOnly).toString().padStart(2, '0') +
							':' +
							secondsOnly.toString().padStart(2, '0') +
							': ' +
							framesOnly.toString().padStart(2, '0'),
						size: 14
					};
				case 'timestamp_noHours':
					return {
						text:
							(timeRemaining ? '-' : '') +
							((hours * 60) + minutesOnly).toString().padStart(2, '0') +
							':' +
							secondsOnly.toString().padStart(2, '0'),
						size: 18
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

	private updateWsLayerTimingVariables(layer: number, column: number): void {
		const connectState = parameterStates.get()[`/composition/layers/${layer}/clips/${column}/connect`]?.value;
		if (connectState !== 'Connected' && connectState !== 'ConnectedAndSelected') return;

		const timing = this.wsPositionToSeconds(layer, column);
		if (!timing) return;

		const { elapsedSec, totalSec, remainingSec } = timing;
		const prefix = `ws_layer_${layer}`;
		this.resolumeArenaInstance.setVariableValues({
			[`${prefix}_elapsed`]: this.wsSecondsToTimecode(elapsedSec),
			[`${prefix}_elapsed_seconds`]: Math.round(elapsedSec).toString(),
			[`${prefix}_duration`]: this.wsSecondsToTimecode(totalSec),
			[`${prefix}_remaining`]: this.wsSecondsToTimecode(remainingSec),
			[`${prefix}_remaining_seconds`]: Math.round(remainingSec).toString(),
			[`${prefix}_progress`]: totalSec > 0 ? (elapsedSec / totalSec * 100).toFixed(0) : '0',
		});
	}

	/** Extract elapsed/total/remaining seconds from a clip's WebSocket transport position parameter. */
	wsPositionToSeconds(layer: number, column: number): { elapsedSec: number; totalSec: number; remainingSec: number } | null {
		const param = parameterStates.get()[`/composition/layers/${layer}/clips/${column}/transport/position`] as RangeParameter;
		if (!param || param.value === undefined || param.max === undefined || param.max === 0) return null;
		const elapsedSec = param.value / 1000;
		const totalSec = param.max / 1000;
		return { elapsedSec, totalSec, remainingSec: Math.max(0, totalSec - elapsedSec) };
	}

	private wsSecondsToTimecode(sec: number): string {
		const neg = sec < 0;
		const abs = Math.abs(sec);
		const h = Math.floor(abs / 3600);
		const m = Math.floor((abs % 3600) / 60);
		const s = Math.floor(abs % 60);
		const base = h > 0
			? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
			: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		return neg ? `-${base}` : base;
	}
}
