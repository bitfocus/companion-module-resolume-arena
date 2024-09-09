import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {drawPercentage, drawVolume} from '../../image-utils';
import {ResolumeArenaModuleInstance} from '../../index';
import {compositionState, parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {Layer, RangeParameter} from '../api';
import {ClipId} from '../clip/clip-id';

export class LayerUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private layerBypassedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerSoloSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private activeLayers: Map<number, number> = new Map<number, number>();

	private layerSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerMasterSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerVolumeSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerTransitionDurationIds: Set<number> = new Set<number>();
	private layerVolumeIds: Set<number> = new Set<number>();
	private layerOpacityIds: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.updateActiveLayers();
			this.updateLayerTransitionDurations();
			this.updateLayerVolumes();
			this.updateLayerOpacities();
		}
		if (data.path) {
			if (!!data.path.match(/\/composition\/layers\/\d+\/select/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerSelected');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/solo/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerSolo');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/bypassed/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerBypassed');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/master/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerMaster');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/video\/opacity/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerOpacity');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/audio\/volume/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerVolume');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/transition\/duration/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerTransitionDuration');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/transport\/position/)) {
				this.resolumeArenaInstance.checkFeedbacks('layerTransportPosition');
			}
			if (!!data.path.match(/\/composition\/layers\/\d+\/clips\/\d+\/connect/)) {
				this.updateActiveLayers();
			}
		}
	}

	public getLayerFromCompositionState(layer: any): Layer | undefined {
		const layersObject = compositionState.get()?.layers;
		if (layersObject) {
			return layersObject[layer - 1];
		}
		return undefined;
	}

	public getLayersFromCompositionState(): Layer[] | undefined {
		return compositionState.get()?.layers;
	}

	updateActiveLayers() {
		const layersObject = this.getLayersFromCompositionState();
		if (layersObject) {
			for (const [layerIndex, layerObject] of layersObject.entries()) {
				const layer = layerIndex + 1;
				this.activeLayers.delete(+layer);
				const clipsObject = layerObject.clips;
				if (clipsObject) {
					for (const [columnIndex, _clipObject] of clipsObject.entries()) {
						const column = columnIndex + 1;
						const connectedState = parameterStates.get()['/composition/layers/' + layer + '/clips/' + column + '/connect']?.value;
						if (connectedState === 'Connected' || connectedState === 'Connected & previewing') {
							this.activeLayers.set(layer, column);
						}
					}
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerActive');
			this.resolumeArenaInstance.checkFeedbacks('layerTransportPosition');
		}
	}

	updateLayerTransitionDurations() {
		const layersObject = this.getLayersFromCompositionState();
		if (layersObject) {
			for (const layerTransitionDurationId of this.layerTransitionDurationIds) {
				this.layerTransitionDurationFeedbackUnsubscribe(layerTransitionDurationId);
			}
			for (const [layerIndex, _layerObject] of layersObject.entries()) {
				const layer = layerIndex + 1;
				this.layerTransitionDurationFeedbackSubscribe(layer)
			}
			this.resolumeArenaInstance.checkFeedbacks('layerVolume');
		}
	}

	updateLayerVolumes() {
		const layersObject = this.getLayersFromCompositionState();
		if (layersObject) {
			for (const layerVolumeId of this.layerVolumeIds) {
				this.layerVolumeWebsocketUnsubscribe(layerVolumeId);
			}
			for (const [layer, _subscriptionId] of this.layerVolumeSubscriptions.entries()) {
				this.layerWebsocketFeedbackSubscribe(layer)
			}
			this.resolumeArenaInstance.checkFeedbacks('layerVolume');
		}
	}

	updateLayerOpacities() {
		const layersObject = this.getLayersFromCompositionState();
		if (layersObject) {
			for (const layerOpacityId of this.layerOpacityIds) {
				this.layerOpacityWebsocketUnsubscribe(layerOpacityId);
			}
			for (const [layer, _subscriptionId] of this.layerOpacitySubscriptions.entries()) {
				this.layerOpacityWebsocketSubscribe(layer)
			}
			this.resolumeArenaInstance.checkFeedbacks('layerOpacity');
		}
	}

	/////////////////////////////////////////////////
	// BYPASSED
	/////////////////////////////////////////////////

	async layerBypassedFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<boolean> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/bypassed']?.value;
		}
		return false;
	}

	async layerBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerBypassedSubscriptions.get(layer)) {
				this.layerBypassedSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/bypassed');
			}
			this.layerBypassedSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerByPassedSubscription = this.layerBypassedSubscriptions.get(layer);
		if (layer !== undefined && layerByPassedSubscription) {
			layerByPassedSubscription.delete(feedback.id);
			if (layerByPassedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/bypassed');
				this.layerBypassedSubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// SOLO
	/////////////////////////////////////////////////

	async layerSoloFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<boolean> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/solo']?.value;
		}
		return false;
	}

	async layerSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerSoloSubscriptions.get(layer)) {
				this.layerSoloSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/solo');
			}
			this.layerSoloSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerSoloSubscription = this.layerSoloSubscriptions.get(layer);
		if (layer !== undefined && layerSoloSubscription) {
			layerSoloSubscription.delete(feedback.id);
			if (layerSoloSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/solo');
				this.layerSoloSubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// ACTIVE
	/////////////////////////////////////////////////

	async layerActiveFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<boolean> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			return this.activeLayers.has(+layer);
			// TODO: #47 request feature return parameterStates.get()['/composition/layers/' + layer + '/active']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	async layerSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<boolean> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/select']?.value;
		}
		return false;
	}

	async layerSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerSelectedSubscriptions.get(layer)) {
				this.layerSelectedSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/select');
			}
			this.layerSelectedSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerSelectedSubscription = this.layerSelectedSubscriptions.get(layer);
		if (layer !== undefined && layerSelectedSubscription) {
			layerSelectedSubscription.delete(feedback.id);
			if (layerSelectedSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/select');
				this.layerSelectedSubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// Master
	/////////////////////////////////////////////////

	async layerMasterFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const master = parameterStates.get()['/composition/layers/' + layer + '/master']?.value;
		if (layer !== undefined && master !== undefined) {
			return {
				text: Math.round(master * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(master),
			};
		}
		return {text: '?'};
	}

	async layerMasterFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerMasterSubscriptions.get(layer)) {
				this.layerMasterSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/master');
			}
			this.layerMasterSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerMasterFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerMasterSubscription = this.layerMasterSubscriptions.get(layer);
		if (layer !== undefined && layerMasterSubscription) {
			layerMasterSubscription.delete(feedback.id);
			if (layerMasterSubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/master');
				this.layerMasterSubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// Volume
	/////////////////////////////////////////////////

	async layerVolumeFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const volume = parameterStates.get()['/composition/layers/' + layer + '/audio/volume']?.value;
		if (volume !== undefined) {
			return {
				text: Math.round(volume * 100)/100+ 'db',
				show_topbar: false,
				imageBuffer: drawVolume(volume)
			};
		}
		return {text: '?'};
	}

	async layerVolumeFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerVolumeSubscriptions.get(layer)) {
				this.layerVolumeSubscriptions.set(layer, new Set());
			}
			this.layerVolumeSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerVolumeFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerVolumeSubscription = this.layerVolumeSubscriptions.get(layer);
		if (layer !== undefined && layerVolumeSubscription) {
			layerVolumeSubscription.delete(feedback.id);
			if (layerVolumeSubscription.size === 0) {
				this.layerVolumeSubscriptions.delete(layer);
			}
		}
	}

	layerWebsocketFeedbackSubscribe(layer: number) {
		const layerObject = this.getLayerFromCompositionState(layer);
		const layerVolumeId = layerObject?.audio?.volume?.id;
		if (layerVolumeId) {
			this.layerVolumeIds.add(layerVolumeId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerVolumeId!);
		}
	}

	layerVolumeWebsocketUnsubscribe(layerVolumeId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerVolumeId!);
	}


	/////////////////////////////////////////////////
	// Opacity
	/////////////////////////////////////////////////

	async layerOpacityFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const opacity = parameterStates.get()['/composition/layers/' + layer + '/video/opacity']?.value;
		if (opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	async layerOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		if (layer !== undefined) {
			if (!this.layerOpacitySubscriptions.get(layer)) {
				this.layerOpacitySubscriptions.set(layer, new Set());
			}
			this.layerOpacitySubscriptions.get(layer)?.add(feedback.id);
		}
	}

	async layerOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const layerOpacitySubscription = this.layerOpacitySubscriptions.get(layer);
		if (layer !== undefined && layerOpacitySubscription) {
			layerOpacitySubscription.delete(feedback.id);
			if (layerOpacitySubscription.size === 0) {
				this.layerOpacitySubscriptions.delete(layer);
			}
		}
	}


	layerOpacityWebsocketSubscribe(layer: number) {
		const layerObject = this.getLayerFromCompositionState(layer);
		const layerOpacityId = layerObject?.video?.opacity?.id;
		if (layerOpacityId) {
			this.layerOpacityIds.add(layerOpacityId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerOpacityId!);
		}
	}

	layerOpacityWebsocketUnsubscribe(layerOpacityId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerOpacityId!);
	}

	/////////////////////////////////////////////////
	// Transition Duration
	/////////////////////////////////////////////////

	async layerTransitionDurationFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		const duration = parameterStates.get()['/composition/layers/' + layer + '/transition/duration']?.value;
		if (layer !== undefined && duration !== undefined) {
			return {
				text: Math.round(duration * 100) + '%',
				show_topbar: false,
				imageBuffer: drawPercentage(duration),
			};
		}
		return {text: '?'};
	}

	layerTransitionDurationFeedbackSubscribe(layer: number) {
		const layerObject = this.getLayerFromCompositionState(layer);
		const layerTransitionDurationId = layerObject?.transition?.duration?.id;
		if (layerTransitionDurationId) {
			this.layerTransitionDurationIds.add(layerTransitionDurationId);
			this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerTransitionDurationId!);
		}
	}

	layerTransitionDurationFeedbackUnsubscribe(layerTransitionDurationId: number) {
		this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerTransitionDurationId!);
	}

	/////////////////////////////////////////////////
	// Transport Position
	/////////////////////////////////////////////////

	async layerTransportPositionFeedbackCallback(feedback: CompanionFeedbackInfo): Promise<CompanionAdvancedFeedbackResult> {
		const layer = +await this.resolumeArenaInstance.parseVariablesInString(feedback.options.layer as string);
		var column = this.activeLayers.get(+layer)!;
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
						size: 14,
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
						size: 14,
					};
				default:
					break;
			}
		}
		return {text: '?'};
	}
}
