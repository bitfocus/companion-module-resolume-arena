import ArenaRestApi from './arena-api/rest';
import ArenaOscApi from './arena-api/osc';
import {ClipStatus} from './arena-api/child-apis/clip-options/ClipStatus';
import sleep from './sleep';
import {LayerOptions} from './arena-api/child-apis/layer-options/LayerOptions';
import {configFields, ResolumeArenaConfig} from './config-fields';

import {bypassLayer} from './actions/bypass-layer';
import {clearLayer} from './actions/clear-layer';
import {clearAllLayers} from './actions/clear-all-layers';
import {compNextCol} from './actions/comp-next-col';
import {compPrevCol} from './actions/comp-prev-col';
import {connectClip} from './actions/connect-clip';
import {groupNextCol} from './actions/group-next-col';
import {groupPrevCol} from './actions/group-prev-col';
import {layerNextCol} from './actions/layer-next-col';
import {layerPrevCol} from './actions/layer-prev-col';
import {selectClip} from './actions/select-clip';
import {soloLayer} from './actions/solo-layer';
import {tempoTap} from './actions/tempo-tap';
import {triggerColumn} from './actions/trigger-column';
import {customOscCommand} from './actions/custom-osc';
import {
	combineRgb,
	CompanionActionDefinitions,
	CompanionFeedbackInfo,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
} from '@companion-module/base';

interface ClipSubscription {
	layer: number;
	column: number;
}

class instance extends InstanceBase<ResolumeArenaConfig> {
	private config!: ResolumeArenaConfig;
	private _restApi: ArenaRestApi | null = null;
	private _oscApi: ArenaOscApi | null = null;
	private isPolling: boolean = false;
	private connectedClips: Set<string> = new Set<string>();
	private clipStatusSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
	private clipThumbSubscriptions: Set<string> = new Set<string>();
	private clipConnectedSubscriptions: Set<ClipSubscription> = new Set<ClipSubscription>();
	private clipStatus: Map<string, ClipStatus> = new Map<string, ClipStatus>();
	private clipThumbs: Map<string, string> = new Map<string, string>();
	private clipNames: Map<string, string> = new Map<string, string>();
	private bypassedLayers: Set<number> = new Set<number>();
	private LayerBypassedSubscriptions: Set<number> = new Set<number>();

	constructor(internal: unknown) {
		super(internal);
	}

	/**
	 * Provide a simple return
	 * of the necessary fields for the
	 * instance configuration screen.
	 * @return {object[]}
	 */
	getConfigFields(): SomeCompanionConfigField[] {
		return configFields();
	}

	getRestApi(): ArenaRestApi | null {
		return this._restApi;
	}

	getOscApi(): ArenaOscApi | null {
		return this._oscApi;
	}

	get actions(): CompanionActionDefinitions {
		var restApi = this.getRestApi.bind(this);
		var oscApi = this.getOscApi.bind(this);
		var actions: CompanionActionDefinitions = {
			bypassLayer: bypassLayer(restApi, oscApi),
			clearAll: clearAllLayers(restApi, oscApi),
			clearLayer: clearLayer(restApi, oscApi),
			compNextCol: compNextCol(restApi, oscApi),
			compPrevCol: compPrevCol(restApi, oscApi),
			custom: customOscCommand(oscApi),
			grpNextCol: groupNextCol(restApi, oscApi),
			grpPrevCol: groupPrevCol(restApi, oscApi),
			layNextCol: layerNextCol(restApi, oscApi),
			layPrevCol: layerPrevCol(restApi, oscApi),
			selectClip: selectClip(restApi, oscApi),
			soloLayer: soloLayer(restApi, oscApi),
			tempoTap: tempoTap(restApi, oscApi),
			triggerClip: connectClip(restApi, oscApi),
			triggerColumn: triggerColumn(restApi, oscApi),
		};
		return actions;
	}

	setupFeedback() {
		if (this._restApi) {
			this.setFeedbackDefinitions({
				connectedClip: {
					type: 'boolean',
					name: 'Connected Clip',
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: [
						{
							id: 'layer',
							type: 'number',
							label: 'Layer',
							default: 1,
							min: 1,
							max: 65535,
						},
						{
							id: 'column',
							type: 'number',
							label: 'Column',
							default: 1,
							min: 1,
							max: 65535,
						},
					],
					callback: (feedback: CompanionFeedbackInfo): boolean => {
						var layer = feedback.options.layer;
						var column = feedback.options.column;
						if (layer !== undefined && column !== undefined) {
							return this.connectedClips.has(`${layer}-${column}`);
						}
						return false;
					},
					subscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						var column = feedback.options.column as number;
						if (layer !== undefined && column !== undefined) {
							this.addClipConnectedSubscription(layer, column);
						}
					},
					unsubscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						var column = feedback.options.column as number;
						if (layer !== undefined && column !== undefined) {
							this.addClipConnectedSubscription(layer, column);
						}
					},
				},
				clipInfo: {
					type: 'advanced',
					name: 'Clip Info',
					options: [
						{
							id: 'layer',
							type: 'number',
							label: 'Layer',
							default: 1,
							min: 1,
							max: 65535,
						},
						{
							id: 'column',
							type: 'number',
							label: 'Column',
							default: 1,
							min: 1,
							max: 65535,
						},
						{
							id: 'showThumb',
							type: 'checkbox',
							label: 'Thumbnail',
							default: false,
						},
					],
					callback: (feedback: CompanionFeedbackInfo): {} => {
						var layer = feedback.options.layer;
						var column = feedback.options.column;
						if (layer !== undefined && column !== undefined) {
							var key = `${layer}-${column}`;
							var name = this.clipNames.get(key);
							var result: {
								text: string | undefined;
								png64: string | undefined;
							} = {
								text: name,
								png64: undefined,
							};
							if (feedback.options.showThumb) {
								result.png64 = this.clipThumbs.get(key);
							}
							return result;
						}
						return {
							text: 'not found',
						};
					},
					subscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						var column = feedback.options.column as number;
						if (layer !== undefined && column !== undefined) {
							this.addClipStatusSubscription(layer, column);
							if (feedback.options.showThumb) {
								this.addClipThumbSubscription(layer, column);
							} else {
								this.removeClipThumbSubscription(layer, column);
							}
						}
					},
					unsubscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						var column = feedback.options.column as number;
						if (layer !== undefined && column !== undefined) {
							this.removeClipStatusSubscription(layer, column);
							this.removeClipThumbSubscription(layer, column);
						}
					},
				},
				layerBypassed: {
					type: 'boolean',
					name: 'Layer Bypassed',
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
					options: [
						{
							id: 'layer',
							type: 'number',
							label: 'Layer',
							default: 1,
							min: 1,
							max: 65535,
						},
					],
					callback: (feedback: CompanionFeedbackInfo): boolean => {
						var layer = feedback.options.layer;
						if (layer !== undefined) {
							return this.bypassedLayers.has(layer as number);
						}
						return false;
					},
					subscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						if (layer !== undefined) {
							this.addLayerBypassedSubscription(layer);
						}
					},
					unsubscribe: (feedback: CompanionFeedbackInfo) => {
						var layer = feedback.options.layer as number;
						if (layer !== undefined) {
							this.addLayerBypassedSubscription(layer);
						}
					},
				},
			});
		} else {
			this.setFeedbackDefinitions({});
		}
	}

	setupPresets() {
		if (this._restApi) {
			this.setPresetDefinitions({
				playClip: {
					type: 'button',
					category: 'Commands',
					name: 'Play Clip',
					style: {
						size: '18',
						text: 'Play Clip',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'triggerClip',
									options: {
										layer: '1',
										column: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'connectedClip',
							options: {
								layer: '1',
								column: '1',
							},
						},
						{
							feedbackId: 'clipInfo',
							options: {
								layer: '1',
								column: '1',
							},
						},
					],
				},
			});
		} else {
			this.setPresetDefinitions({});
		}
	}

	addLayerBypassedSubscription(layer: number) {
		this.LayerBypassedSubscriptions.add(layer);
		this.pollStatus();
		this.checkFeedbacks('layerBypassed');
	}

	removeLayerBypassedSubscription(layer: number) {
		this.LayerBypassedSubscriptions.delete(layer);
	}

	addClipConnectedSubscription(layer: number, column: number) {
		this.clipConnectedSubscriptions.add({layer, column});
		this.pollStatus();
		this.checkFeedbacks('connectedClip');
	}

	removeClipConnectedSubscription(layer: number, column: number) {
		for (var clip of this.clipConnectedSubscriptions) {
			if (clip.layer == layer && clip.column == column) {
				this.clipConnectedSubscriptions.delete(clip);
				break;
			}
		}
	}

	addClipStatusSubscription(layer: number, column: number) {
		this.clipStatusSubscriptions.add({layer, column});
		this.pollStatus();
		this.checkFeedbacks('clipInfo');
	}

	removeClipStatusSubscription(layer: number, column: number) {
		for (var clip of this.clipStatusSubscriptions) {
			if (clip.layer == layer && clip.column == column) {
				this.clipStatusSubscriptions.delete(clip);
				break;
			}
		}
	}

	addClipThumbSubscription(layer: number, column: number) {
		this.clipThumbSubscriptions.add(`${layer}-${column}`);
		this.pollStatus();
		this.checkFeedbacks('clipInfo');
	}

	removeClipThumbSubscription(layer: number, column: number) {
		this.clipThumbSubscriptions.delete(`${layer}-${column}`);
	}

	/**
	 * Called when the configuration is updated.
	 * @param config The new config object
	 */
	async configUpdated(config: ResolumeArenaConfig): Promise<void> {
		this.config = config;
		this.restartApis();
		this.subscribeFeedbacks();
		return Promise.resolve();
	}

	/**
	 * Main initialization function called once the module is
	 * OK to start doing things. Principally, this is when
	 * the module should establish a connection to the device.
	 * @return {void}
	 */
	async init(config: ResolumeArenaConfig, _isFirstInit: boolean): Promise<void> {
		this.config = config;
		this.restartApis();
		this.subscribeFeedbacks();
		this.setupFeedback();
		this.setActionDefinitions(this.actions);
		this.setupPresets();
	}

	private restartApis() {
		const config = this.config;
		if (config.webapiPort) {
			this._restApi = new ArenaRestApi(config.host, config.webapiPort, config.useSSL);
		} else {
			this._restApi = null;
		}
		if (config.port) {
			this._oscApi = new ArenaOscApi(config.host, config.port, this.oscSend.bind(this));
		} else {
			this._oscApi = null;
		}
		this.setupFeedback();
		this.setActionDefinitions(this.actions);
		this.pollStatus();
	}
	/**
	 * Clean up the instance before it is destroyed.
	 * This is called both on shutdown and when an instance
	 * is disabled or deleted. Destroy any timers and socket
	 * connections here.
	 * @return {void}
	 */
	async destroy(): Promise<void> {
		this._restApi = null;
		this._oscApi = null;
	}

	/**
	 * Poll for in use status continuously until there are
	 * no more subscriptions or until the module is destroyed
	 * @return {void}
	 */
	private async pollStatus() {
		if (this.isPolling) {
			return;
		}
		this.isPolling = true;
		try {
			// loop until we don't need to poll any more
			while (this._restApi) {
				// check the status via the api
				try {
					// only poll status if there are no other subscriptions
					if (this.hasPollingSubscriptions) {
						await this._restApi?.productInfo();
					}
					await this.pollClips();
					await this.pollLayers();
					this.updateStatus(InstanceStatus.Ok);
				} catch (e: any) {
					this.updateStatus(InstanceStatus.UnknownError, e.message);
				}
				await sleep(500);
			}
			if (!this._restApi) {
				// no way to tell if OSC is connected
				this.updateStatus(InstanceStatus.Ok);
			}
		} finally {
			this.isPolling = false;
		}
	}

	get hasPollingSubscriptions(): boolean {
		return (
			this.LayerBypassedSubscriptions.size > 0 ||
			this.clipConnectedSubscriptions.size > 0 ||
			this.clipStatusSubscriptions.size > 0
		);
	}

	async pollLayers() {
		try {
			if (this.LayerBypassedSubscriptions.size > 0) {
				for (var layer of this.LayerBypassedSubscriptions) {
					var status = (await this._restApi?.Layers.getSettings(layer)) as LayerOptions;
					if (status.bypassed?.value) {
						this.bypassedLayers.add(layer);
					} else {
						this.bypassedLayers.delete(layer);
					}
				}
				this.checkFeedbacks('layerBypassed');
			}
		} catch (e) {
			console.log(e);
		}
	}

	async pollClips() {
		var clips = new Set<ClipSubscription>();
		// combine sets
		for (var clip of this.clipStatusSubscriptions) {
			clips.add(clip);
		}
		for (var clip of this.clipConnectedSubscriptions) {
			clips.add(clip);
		}
		if (clips.size > 0) {
			let connectedChanged = false;
			let nameChanged = false;
			let thumbChanged = false;
			for (var clip of clips) {
				var key = `${clip.layer}-${clip.column}`;
				var status = (await this._restApi?.Clips.getStatus(clip.layer, clip.column)) as ClipStatus;
				var name = status?.name?.value;
				this.clipStatus.set(key, status);
				if (name !== this.clipNames.get(key)) {
					this.clipNames.set(key, name);
					nameChanged = true;
				}
				var isConnected = status?.connected.value === 'Connected';
				if (isConnected) {
					if (!this.connectedClips.has(key)) {
						connectedChanged = true;
						this.connectedClips.add(key);
					}
				} else {
					if (this.connectedClips.has(key)) {
						connectedChanged = true;
						this.connectedClips.delete(key);
					}
				}
				if (nameChanged && this.clipThumbSubscriptions.has(key)) {
					this.clipThumbs.set(key, (await this._restApi?.Clips.getThumb(clip.layer, clip.column)) ?? '');
					thumbChanged = true;
				}
			}
			if (connectedChanged) {
				this.checkFeedbacks('connectedClip');
			}
			if (nameChanged || thumbChanged) {
				this.checkFeedbacks('clipInfo');
			}
		}
	}
}

function getUpgradeScripts(): CompanionStaticUpgradeScript<ResolumeArenaConfig>[] {
	return [
		function (
			_context: CompanionUpgradeContext<ResolumeArenaConfig>,
			_props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
		): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
			return {
				updatedConfig: null,
				updatedActions: [],
				updatedFeedbacks: [],
			};
		},
	];
}

exports = module.exports = instance;
runEntrypoint(instance, getUpgradeScripts());
