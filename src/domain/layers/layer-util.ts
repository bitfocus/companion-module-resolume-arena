import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {drawPercentage} from '../../defaults';
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
	private layerOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerTransitionDurationSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerUtils constructor called');
	}

	messageUpdates(data: {path: any}, isComposition: boolean) {
		if (isComposition) {
			this.updateActiveLayers();
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
				this.resolumeArenaInstance.checkFeedbacks('layerOpacity');
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
				const layer = layerIndex+1
				this.activeLayers.delete(+layer);
				const clipsObject = layerObject.clips;
				if (clipsObject) {
					for (const [columnIndex, _clipObject] of clipsObject.entries()) {
						const column = columnIndex+1;
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

	/////////////////////////////////////////////////
	// BYPASSED
	/////////////////////////////////////////////////

	layerBypassedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/bypassed']?.value;
		}
		return false;
	}

	layerBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerBypassedSubscriptions.get(layer)) {
				this.layerBypassedSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/bypassed');
			}
			this.layerBypassedSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
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

	layerSoloFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/solo']?.value;
		}
		return false;
	}

	layerSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerSoloSubscriptions.get(layer)) {
				this.layerSoloSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/solo');
			}
			this.layerSoloSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
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

	layerActiveFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		let layer = feedback.options.layer as number;
		if (layer !== undefined) {
			return this.activeLayers.has(+layer);
			// TODO: #47 request feature return parameterStates.get()['/composition/layers/' + layer + '/active']?.value;
		}
		return false;
	}

	/////////////////////////////////////////////////
	// SELECTED
	/////////////////////////////////////////////////

	layerSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return parameterStates.get()['/composition/layers/' + layer + '/select']?.value;
		}
		return false;
	}

	layerSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerSelectedSubscriptions.get(layer)) {
				this.layerSelectedSubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/select');
			}
			this.layerSelectedSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
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
	// Opacity
	/////////////////////////////////////////////////

	layerOpacityFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer;
		const opacity = parameterStates.get()['/composition/layers/' + layer + '/master']?.value;
		if (layer !== undefined && opacity !== undefined) {
			return {
				text: Math.round(opacity * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(opacity),
			};
		}
		return {text: '?'};
	}

	layerOpacityFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerOpacitySubscriptions.get(layer)) {
				this.layerOpacitySubscriptions.set(layer, new Set());
				this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/master');
			}
			this.layerOpacitySubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerOpacityFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		const layerOpacitySubscription = this.layerOpacitySubscriptions.get(layer);
		if (layer !== undefined && layerOpacitySubscription) {
			layerOpacitySubscription.delete(feedback.id);
			if (layerOpacitySubscription.size === 0) {
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/master');
				this.layerOpacitySubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// Transition Duration
	/////////////////////////////////////////////////

	layerTransitionDurationFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer;
		const duration = parameterStates.get()['/composition/layers/' + layer + '/transition/duration']?.value;
		if (layer !== undefined && duration !== undefined) {
			return {
				text: Math.round(duration * 100) + '%',
				show_topbar: false,
				png64: drawPercentage(duration),
			};
		}
		return {text: '?'};
	}

	layerTransitionDurationFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerTransitionDurationSubscriptions.get(layer)) {
				this.layerTransitionDurationSubscriptions.set(layer, new Set());
				const layerObject = this.getLayerFromCompositionState(layer);
				const layerTransitionDurationId = layerObject?.transition?.duration?.id;
				this.resolumeArenaInstance.getWebsocketApi()?.subscribeParam(layerTransitionDurationId!);
				// this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/master');
			}
			this.layerTransitionDurationSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerTransitionDurationFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		const layerTransitionDurationSubscription = this.layerTransitionDurationSubscriptions.get(layer);
		if (layer !== undefined && layerTransitionDurationSubscription) {
			layerTransitionDurationSubscription.delete(feedback.id);
			if (layerTransitionDurationSubscription.size === 0) {
				const layerObject = this.getLayerFromCompositionState(layer);
				const layerTransitionDurationId = layerObject?.transition?.duration?.id;
				this.resolumeArenaInstance.getWebsocketApi()?.unsubscribeParam(layerTransitionDurationId!);
				// this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/master');
				this.layerTransitionDurationSubscriptions.delete(layer);
			}
		}
	}

	/////////////////////////////////////////////////
	// Transport Position
	/////////////////////////////////////////////////

	layerTransportPositionFeedbackCallback(feedback: CompanionFeedbackInfo): CompanionAdvancedFeedbackResult {
		var layer = feedback.options.layer as number;
		console.log('layer',layer, this.activeLayers)
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
