import {CompanionAdvancedFeedbackResult, CompanionFeedbackInfo} from '@companion-module/base';
import {LayerOptions} from '../../arena-api/child-apis/layer-options/LayerOptions';
import {ResolumeArenaModuleInstance} from '../../index';
import {parameterStates} from '../../state';
import {MessageSubscriber} from '../../websocket';
import {drawPercentage} from '../../defaults';

export class LayerUtils implements MessageSubscriber {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;

	private layerBypassedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerSoloSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private activeLayers: Set<number> = new Set<number>();
	private layerActiveSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	private layerSelectedSubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();
	private layerOpacitySubscriptions: Map<number, Set<string>> = new Map<number, Set<string>>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerUtils constructor called');
	}

	messageUpdates(data: {path: any}, _isComposition: boolean) {
		if(data.path){
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
		}
	}

	messageFilter() {
		return (message: any) => !!(message.path && message.path.match(/\/composition\/layers.?/));
	}

	hasPollingSubscriptions(): boolean {
		return this.layerActiveSubscriptions.size > 0;
	}

	async poll() {
		if (this.layerActiveSubscriptions.size > 0) {
			for (var layerSubscription of this.layerActiveSubscriptions) {
				const layer = layerSubscription[0];
				var status = (await this.resolumeArenaInstance.restApi?.Layers.getSettings(layer)) as LayerOptions;
				if (status.clips.filter((clip) => clip.connected.value === 'Connected').length > 0) {
					this.activeLayers.add(layer);
				} else {
					this.activeLayers.delete(layer);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerActive');
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
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return this.activeLayers.has(layer as number);
			// TODO request feature return parameterStates.get()['/composition/layers/' + layer + '/active']?.value;
		}
		return false;
	}

	layerActiveFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			if (!this.layerActiveSubscriptions.get(layer)) {
				this.layerActiveSubscriptions.set(layer, new Set());
				// this.resolumeArenaInstance.getWebsocketApi()?.subscribePath('/composition/layers/' + layer + '/select');
			}
			this.layerActiveSubscriptions.get(layer)?.add(feedback.id);
		}
	}

	layerActiveFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		const layerActiveSubscription = this.layerActiveSubscriptions.get(layer);
		if (layer !== undefined && layerActiveSubscription) {
			layerActiveSubscription.delete(feedback.id);
			if (layerActiveSubscription.size === 0) {
				// this.resolumeArenaInstance.getWebsocketApi()?.unsubscribePath('/composition/layers/' + layer + '/select');
				this.layerActiveSubscriptions.delete(layer);
			}
		}
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
		if (layer !== undefined && opacity!==undefined) {
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
}
