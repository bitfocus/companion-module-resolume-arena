import ArenaOscApi from './arena-api/osc';
import ArenaRestApi from './arena-api/rest';
import {configFields, ResolumeArenaConfig} from './config-fields';
import sleep from './sleep';

import {
	combineRgb,
	CompanionActionDefinitions,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
} from '@companion-module/base';
import {bypassLayer} from './actions/bypass-layer';
import {clearAllLayers} from './actions/clear-all-layers';
import {clearLayer} from './actions/clear-layer';
import {compNextCol} from './actions/comp-next-col';
import {compPrevCol} from './actions/comp-prev-col';
import {connectClip} from './actions/connect-clip';
import {customOscCommand} from './actions/custom-osc';
import {groupNextCol} from './actions/group-next-col';
import {groupPrevCol} from './actions/group-prev-col';
import {layerNextCol} from './actions/layer-next-col';
import {layerPrevCol} from './actions/layer-prev-col';
import {selectClip} from './actions/select-clip';
import {soloLayer} from './actions/solo-layer';
import {tempoTap} from './actions/tempo-tap';
import {triggerColumn} from './actions/trigger-column';
import {
	getColumnOption,
	getDefaultLayerColumnOptions,
	getDefaultStyleRed,
	getDefaultStyleGreen,
	getLayerOption,
	getDefaultStyleBlue,
} from './defaults';
import {ClipUtils} from './domain/clip/clip-utils';
import {LayerUtils} from './domain/layers/layer-util';
import { selectLayer } from './actions/select-layer';

export class ResolumeArenaModuleInstance extends InstanceBase<ResolumeArenaConfig> {
	private config!: ResolumeArenaConfig;
	public restApi: ArenaRestApi | null = null;
	private oscApi: ArenaOscApi | null = null;
	private isPolling: boolean = false;

	private clipUtils: ClipUtils;
	private layerUtils: LayerUtils;

	constructor(internal: unknown) {
		super(internal);

		this.clipUtils = new ClipUtils(this);
		this.layerUtils = new LayerUtils(this);
	}

	/**
	 * Main initialization function called once the module is
	 * OK to start doing things. Principally, this is when
	 * the module should establish a connection to the device.
	 */
	async init(config: ResolumeArenaConfig, _isFirstInit: boolean): Promise<void> {
		this.config = config;
		this.restartApis();
		this.subscribeFeedbacks();
		this.setupFeedback();
		this.setActionDefinitions(this.actions);
		this.setupPresets();
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
			selectLayer: selectLayer(restApi, oscApi),
			soloLayer: soloLayer(restApi, oscApi),
			tempoTap: tempoTap(restApi, oscApi),
			triggerClip: connectClip(restApi, oscApi),
			triggerColumn: triggerColumn(restApi, oscApi),
		};
		return actions;
	}

	setupFeedback() {
		if (this.restApi) {
			this.setFeedbackDefinitions({
				connectedClip: {
					type: 'boolean',
					name: 'Connected Clip',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerOption(), ...getColumnOption()],
					callback: this.clipUtils.connectedClipsFeedbackCallback.bind(this.clipUtils),
					subscribe: this.clipUtils.connectedClipsSubscribe.bind(this.clipUtils),
					unsubscribe: this.clipUtils.connectedClipsUnsubscribe.bind(this.clipUtils),
				},
				clipInfo: {
					type: 'advanced',
					name: 'Clip Info',
					options: [
						...getLayerOption(),
						...getColumnOption(),
						{
							id: 'showThumb',
							type: 'checkbox',
							label: 'Show Thumbnail',
							default: false,
						},
						{
							id: 'showName',
							type: 'checkbox',
							label: 'Show Name',
							default: true,
						},
					],
					callback: this.clipUtils.clipInfoFeedbackCallback.bind(this.clipUtils),
					subscribe: this.clipUtils.clipInfoSubscribe.bind(this.clipUtils),
					unsubscribe: this.clipUtils.clipInfoUnsubscribe.bind(this.clipUtils),
				},
				layerBypassed: {
					type: 'boolean',
					name: 'Layer Bypassed',
					defaultStyle: getDefaultStyleRed(),
					options: [...getLayerOption()],
					callback: this.layerUtils.layerBypassedFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerBypassedFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerBypassedFeedbackUnsubscribe.bind(this.layerUtils),
				},
				layerSolo: {
					type: 'boolean',
					name: 'Layer Solo',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerOption()],
					callback: this.layerUtils.layerSoloFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerSoloFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerSoloFeedbackUnsubscribe.bind(this.layerUtils),
				},
				layerActive: {
					type: 'boolean',
					name: 'Layer Active',
					defaultStyle: getDefaultStyleBlue(),
					options: [...getLayerOption()],
					callback: this.layerUtils.layerActiveFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerActiveFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerActiveFeedbackUnsubscribe.bind(this.layerUtils),
				},
				layerSelected: {
					type: 'boolean',
					name: 'Layer Selected',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerOption()],
					callback: this.layerUtils.layerSelectedFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerSelectedFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerSelectedFeedbackUnsubscribe.bind(this.layerUtils),
				},
			});
		} else {
			this.setFeedbackDefinitions({});
		}
	}

	setupPresets() {
		if (this.restApi) {
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
									options: getDefaultLayerColumnOptions(),
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'connectedClip',
							options: getDefaultLayerColumnOptions(),
							style: getDefaultStyleGreen(),
						},
						{
							feedbackId: 'clipInfo',
							options: {...getDefaultLayerColumnOptions(), showThumb: true, showName: true},
						},
					],
				},
				bypassLayer: {
					type: 'button',
					category: 'Commands',
					name: 'Bypass Layer',
					style: {
						size: '14',
						text: 'Bypass Layer',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'bypassLayer',
									options: {
										layer: '1',
										bypass: 'toggle',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerBypassed',
							options: {
								layer: '1',
							},
							style: getDefaultStyleRed(),
						},
					],
				},
				soloLayer: {
					type: 'button',
					category: 'Commands',
					name: 'Solo Layer',
					style: {
						size: '14',
						text: 'Solo Layer',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'soloLayer',
									options: {
										layer: '1',
										solo: 'toggle',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerSolo',
							options: {
								layer: '1',
							},
							style: getDefaultStyleGreen(),
						},
					],
				},				
				clearLayer: {
					type: 'button',
					category: 'Commands',
					name: 'Clear Layer',
					style: {
						size: '14',
						text: 'Clear Layer',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'clearLayer',
									options: {
										layer: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerActive',
							options: {
								layer: '1',
							},
							style: getDefaultStyleBlue(),
						},
					],
				},
				selectLayer: {
					type: 'button',
					category: 'Commands',
					name: 'Select Layer',
					style: {
						size: '14',
						text: 'Select Layer',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'selectLayer',
									options: {
										layer: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerSelected',
							options: {
								layer: '1',
							},
							style: getDefaultStyleGreen(),
						},
					],
				},		
			});
		} else {
			this.setPresetDefinitions({});
		}
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

	private restartApis() {
		const config = this.config;
		if (config.webapiPort && config.useRest) {
			this.restApi = new ArenaRestApi(config.host, config.webapiPort, config.useSSL);
		} else {
			this.restApi = null;
		}
		if (config.port) {
			this.oscApi = new ArenaOscApi(config.host, config.port, this.oscSend.bind(this));
		} else {
			this.oscApi = null;
		}
		this.setupFeedback();
		this.setActionDefinitions(this.actions);
		this.pollStatus();
	}

	/**
	 * Poll for in use status continuously until there are
	 * no more subscriptions or until the module is destroyed
	 * @return {void}
	 */
	public async pollStatus(): Promise<void> {
		if (this.isPolling) {
			return;
		}
		this.isPolling = true;
		try {
			// loop until we don't need to poll any more
			while (this.restApi) {
				// check the status via the api
				try {
					// only poll status if there are no other subscriptions
					if (!this.hasPollingSubscriptions) {
						await this.restApi?.productInfo();
					}
					await this.clipUtils.poll();
					await this.layerUtils.poll();
					this.updateStatus(InstanceStatus.Ok);
				} catch (e: any) {
					this.updateStatus(InstanceStatus.UnknownError, e.message);
				}
				await sleep(500);
			}
			if (!this.restApi) {
				// no way to tell if OSC is connected
				this.updateStatus(InstanceStatus.Ok);
			}
		} finally {
			this.isPolling = false;
		}
	}

	private hasPollingSubscriptions(): boolean {
		return this.clipUtils.hasPollingSubscriptions() || this.layerUtils.hasPollingSubscriptions();
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
		return this.restApi;
	}

	getOscApi(): ArenaOscApi | null {
		return this.oscApi;
	}

	/**
	 * Clean up the instance before it is destroyed.
	 * This is called both on shutdown and when an instance
	 * is disabled or deleted. Destroy any timers and socket
	 * connections here.
	 * @return {void}
	 */
	async destroy(): Promise<void> {
		this.restApi = null;
		this.oscApi = null;
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

exports = module.exports = ResolumeArenaModuleInstance;
runEntrypoint(ResolumeArenaModuleInstance, getUpgradeScripts());
