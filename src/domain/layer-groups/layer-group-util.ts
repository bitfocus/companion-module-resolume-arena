import {CompanionFeedbackInfo} from '@companion-module/base';
import {ResolumeArenaModuleInstance} from '../../index';
import {LayerGroupOptions} from '../../arena-api/child-apis/layer-group-options/LayerGroupOptions';
import {LayerOptions} from '../../arena-api/child-apis/layer-options/LayerOptions';

export class LayerGroupUtils {
	private resolumeArenaInstance: ResolumeArenaModuleInstance;
	private bypassedLayerGroups: Set<number> = new Set<number>();
	private layerGroupBypassedSubscriptions: Set<number> = new Set<number>();

	private soloLayerGroup: number | undefined = undefined;
	private layerGroupSoloSubscriptions: Set<number> = new Set<number>();

	private activeLayerGroups: Set<number> = new Set<number>();
	private layerGroupActiveSubscriptions: Set<number> = new Set<number>();

	private selectedLayerGroup: number | undefined = undefined;
	private layerGroupSelectedSubscriptions: Set<number> = new Set<number>();

	constructor(resolumeArenaInstance: ResolumeArenaModuleInstance) {
		this.resolumeArenaInstance = resolumeArenaInstance;
		this.resolumeArenaInstance.log('debug', 'LayerGroupUtils constructor called');
	}

	async poll() {
		if (this.layerGroupBypassedSubscriptions.size > 0) {
			for (var layerGroup of this.layerGroupBypassedSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.LayerGroups.getSettings(
					layerGroup
				)) as LayerGroupOptions;
				if (status.bypassed?.value) {
					this.bypassedLayerGroups.add(layerGroup);
				} else {
					this.bypassedLayerGroups.delete(layerGroup);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupBypassed');
		}

		if (this.layerGroupSoloSubscriptions.size > 0) {
			var soloSet = false;
			for (var layerGroup of this.layerGroupSoloSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.LayerGroups.getSettings(
					layerGroup
				)) as LayerGroupOptions;
				if (status.solo?.value) {
					this.soloLayerGroup = layerGroup;
					soloSet = true;
				}
			}
			if (!soloSet) {
				this.soloLayerGroup = undefined;
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupSolo');
		}

		if (this.layerGroupActiveSubscriptions.size > 0) {
			for (var layerGroup of this.layerGroupActiveSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.LayerGroups.getSettings(
					layerGroup
				)) as LayerGroupOptions;
				let activeLayers: Set<number> = new Set<number>();
				for (const layerOptions of status.layers) {
					var statusLayer = (await this.resolumeArenaInstance.restApi?.Layers.getSettingsById(
						layerOptions.id
					)) as LayerOptions;
					if (statusLayer.clips.filter((clip) => clip.connected.value === 'Connected').length > 0) {
						activeLayers.add(layerOptions.id);
					} else {
						activeLayers.delete(layerOptions.id);
					}
				}
				if (activeLayers.size > 0) {
					this.activeLayerGroups.add(layerGroup);
				} else {
					this.activeLayerGroups.delete(layerGroup);
				}
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupActive');
		}

		if (this.layerGroupSelectedSubscriptions.size > 0) {
			var SelectedSet = false;
			for (var layerGroup of this.layerGroupSelectedSubscriptions) {
				var status = (await this.resolumeArenaInstance.restApi?.LayerGroups.getSettings(
					layerGroup
				)) as LayerGroupOptions;
				if (status.selected?.value) {
					this.selectedLayerGroup = layerGroup;
					SelectedSet = true;
				}
			}
			if (!SelectedSet) {
				this.selectedLayerGroup = undefined;
			}
			this.resolumeArenaInstance.checkFeedbacks('layerGroupSelected');
		}
	}

	hasPollingSubscriptions(): boolean {
		return this.layerGroupBypassedSubscriptions.size > 0;
	}

	layerGroupBypassedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup;
		if (layerGroup !== undefined) {
			return this.bypassedLayerGroups.has(layerGroup as number);
		}
		return false;
	}

	layerGroupBypassedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.addLayerGroupBypassedSubscription(layerGroup);
		}
	}

	layerGroupBypassedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.removeLayerGroupBypassedSubscription(layerGroup);
		}
	}

	private addLayerGroupBypassedSubscription(layerGroup: number) {
		this.layerGroupBypassedSubscriptions.add(layerGroup);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerGroupBypassed');
	}

	private removeLayerGroupBypassedSubscription(layerGroup: number) {
		this.layerGroupBypassedSubscriptions.delete(layerGroup);
	}

	layerGroupSoloFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup;
		if (layerGroup !== undefined) {
			return this.soloLayerGroup === (layerGroup as number);
		}
		return false;
	}

	layerGroupSoloFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.addLayerGroupSoloSubscription(layerGroup);
		}
	}

	layerGroupSoloFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.removeLayerGroupSoloSubscription(layerGroup);
		}
	}

	private addLayerGroupSoloSubscription(layerGroup: number) {
		this.layerGroupSoloSubscriptions.add(layerGroup);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerGroupSolo');
	}

	private removeLayerGroupSoloSubscription(layerGroup: number) {
		this.layerGroupSoloSubscriptions.delete(layerGroup);
	}

	layerGroupActiveFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup;
		if (layerGroup !== undefined) {
			return this.activeLayerGroups.has(layerGroup as number);
		}
		return false;
	}

	layerGroupActiveFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.addLayerGroupActiveSubscription(layerGroup);
		}
	}

	layerGroupActiveFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.removeLayerGroupActiveSubscription(layerGroup);
		}
	}

	private addLayerGroupActiveSubscription(layerGroup: number) {
		this.layerGroupActiveSubscriptions.add(layerGroup);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerGroupActive');
	}

	private removeLayerGroupActiveSubscription(layerGroup: number) {
		this.layerGroupActiveSubscriptions.delete(layerGroup);
	}

	layerGroupSelectedFeedbackCallback(feedback: CompanionFeedbackInfo): boolean {
		var layerGroup = feedback.options.layerGroup;
		if (layerGroup !== undefined) {
			return this.selectedLayerGroup === (layerGroup as number);
		}
		return false;
	}

	layerGroupSelectedFeedbackSubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.addLayerGroupSelectedSubscription(layerGroup);
		}
	}

	layerGroupSelectedFeedbackUnsubscribe(feedback: CompanionFeedbackInfo) {
		var layerGroup = feedback.options.layerGroup as number;
		if (layerGroup !== undefined) {
			this.removeLayerGroupSelectedSubscription(layerGroup);
		}
	}

	private addLayerGroupSelectedSubscription(layerGroup: number) {
		this.layerGroupSelectedSubscriptions.add(layerGroup);
		this.resolumeArenaInstance.pollStatus();
		this.resolumeArenaInstance.checkFeedbacks('layerGroupSelected');
	}

	private removeLayerGroupSelectedSubscription(layerGroup: number) {
		this.layerGroupSoloSubscriptions.delete(layerGroup);
	}
}
