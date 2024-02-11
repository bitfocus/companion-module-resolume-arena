import {CompanionFeedbackInfo} from '@companion-module/base';
import {LayerOptions} from '../../arena-api/child-apis/layer-options/LayerOptions';
import {ResolumeArenaModuleInstance} from '../../index';

export class LayerUtils {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;
	private bypassedLayers: Set<number> = new Set<number>();
	private layerBypassedSubscriptions: Set<number> = new Set<number>();

	private soloLayers: Set<number> = new Set<number>();
	private layerSoloSubscriptions: Set<number> = new Set<number>();

	private activeLayers: Set<number> = new Set<number>();
	private layerActiveSubscriptions: Set<number> = new Set<number>();

	private selectedLayer: number | undefined = undefined;
	private layerSelectedSubscriptions: Set<number> = new Set<number>();


	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerUtils constructor called');
	}

	async poll() {
		if (this.layerBypassedSubscriptions.size > 0) {
			for (var layer of this.layerBypassedSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.Layers.getSettings(layer)) as LayerOptions;
				if (status.bypassed?.value) {
					this.bypassedLayers.add(layer);
				} else {
					this.bypassedLayers.delete(layer);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerBypassed');
		}

		if (this.layerSoloSubscriptions.size > 0) {
			for (var layer of this.layerSoloSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.Layers.getSettings(layer)) as LayerOptions;
				if (status.solo?.value) {
					this.soloLayers.add(layer);
				} else {
					this.soloLayers.delete(layer);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerSolo');
		}

		if (this.layerActiveSubscriptions.size > 0) {
			for (var layer of this.layerActiveSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.Layers.getSettings(layer)) as LayerOptions;
				if (status.clips.filter((clip) => clip.connected.value === 'Connected').length > 0) {
					this.activeLayers.add(layer);
				} else {
					this.activeLayers.delete(layer);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerActive');
		}

		if (this.layerSelectedSubscriptions.size > 0) {
			var SelectedSet = false;
			for (var layer of this.layerSelectedSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.Layers.getSettings(layer)) as LayerOptions;
				if (status.selected?.value) {
					this.selectedLayer = layer;
					SelectedSet = true;
				}
			}
			if (!SelectedSet) {
				this.selectedLayer = undefined;
			}
			this.resolumeArenaInstance.checkFeedbacks('layerSelected');
		}
	}

	hasPollingSubscriptions(): boolean {
		return this.layerBypassedSubscriptions.size > 0;
	}

	layerBypassedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return this.bypassedLayers.has(layer as number);
		}
		return false;
	}

	layerBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.addLayerBypassedSubscription(layer);
		}
	}

	layerBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.removeLayerBypassedSubscription(layer);
		}
	}

	private addLayerBypassedSubscription(layer: number) {
		this.layerBypassedSubscriptions.add(layer);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerBypassed');
	}

	private removeLayerBypassedSubscription(layer: number) {
		this.layerBypassedSubscriptions.delete(layer);
	}

	layerSoloFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return this.soloLayers.has(layer as number);
		}
		return false;
	}

	layerSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.addLayerSoloSubscription(layer);
		}
	}

	layerSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.removeLayerSoloSubscription(layer);
		}
	}

	private addLayerSoloSubscription(layer: number) {
		this.layerSoloSubscriptions.add(layer);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerSolo');
	}

	private removeLayerSoloSubscription(layer: number) {
		this.layerSoloSubscriptions.delete(layer);
	}

	layerActiveFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return this.activeLayers.has(layer as number);
		}
		return false;
	}

	layerActiveFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.addLayerActiveSubscription(layer);
		}
	}

	layerActiveFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.removeLayerActiveSubscription(layer);
		}
	}

	private addLayerActiveSubscription(layer: number) {
		this.layerActiveSubscriptions.add(layer);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerActive');
	}

	private removeLayerActiveSubscription(layer: number) {
		this.layerActiveSubscriptions.delete(layer);
	}

	layerSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layer = feedback.options.layer;
		if (layer !== undefined) {
			return this.selectedLayer === (layer as number);
		}
		return false;
	}

	layerSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.addLayerSelectedSubscription(layer);
		}
	}

	layerSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layer = feedback.options.layer as number;
		if (layer !== undefined) {
			this.removeLayerSelectedSubscription(layer);
		}
	}

	private addLayerSelectedSubscription(layer: number) {
		this.layerSelectedSubscriptions.add(layer);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerSelected');
	}

	private removeLayerSelectedSubscription(layer: number) {
		this.layerSoloSubscriptions.delete(layer);
	}
}
