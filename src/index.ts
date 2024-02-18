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
import {layerGroupNextCol} from './actions/layer-group-next-col';
import {layerGroupPrevCol} from './actions/layer-group-prev-col';
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
	getLayerGroupOption,
} from './defaults';
import {ClipUtils} from './domain/clip/clip-utils';
import {LayerUtils} from './domain/layers/layer-util';
import {selectLayer} from './actions/select-layer';
import {soloLayerGroup} from './actions/solo-layer-group';
import {LayerGroupUtils} from './domain/layer-groups/layer-group-util';
import {selectLayerGroup} from './actions/select-layer-group';
import {bypassLayerGroup} from './actions/bypass-layer-group';
import {clearLayerGroup} from './actions/clear-layer-group';
import {ColumnUtils} from './domain/columns/column-util';
import {triggerLayerGroupColumn} from './actions/trigger-layer-group-column';
import {MessageSubscriber, WebsocketInstance as WebsocketApi} from './websocket';
import {layerOpacityChange} from './actions/layer-opacity-change';
import {CompositionUtils} from './domain/composition/composition-utils';
import {compositionOpacityChange} from './actions/composition-opacity-change';
import {layerGroupOpacityChange} from './actions/layer-group-opacity-change';
import {compositionSpeedChange} from './actions/composition-speed-change';
import {clipSpeedChange} from './actions/clip-speed-change';
import {layerTransitionDurationChange} from './actions/layer-transition-duration-change';

export class ResolumeArenaModuleInstance extends InstanceBase<ResolumeArenaConfig> {
	private config!: ResolumeArenaConfig;
	public restApi: ArenaRestApi | null = null;
	private websocketApi: WebsocketApi | null = null;
	private oscApi: ArenaOscApi | null = null;
	private isPolling: boolean = false;

	private clipUtils: ClipUtils;
	private layerUtils: LayerUtils;
	private layerGroupUtils: LayerGroupUtils;
	private columnUtils: ColumnUtils;
	private compositionUtils: CompositionUtils;
	private websocketSubscribers: Set<MessageSubscriber> = new Set();

	constructor(internal: unknown) {
		super(internal);

		this.clipUtils = new ClipUtils(this);
		this.layerUtils = new LayerUtils(this);
		this.layerGroupUtils = new LayerGroupUtils(this);
		this.columnUtils = new ColumnUtils(this);
		this.compositionUtils = new CompositionUtils(this);

		this.websocketSubscribers.add(this.layerUtils);
		this.websocketSubscribers.add(this.layerGroupUtils);
		this.websocketSubscribers.add(this.columnUtils);
		this.websocketSubscribers.add(this.clipUtils);
		this.websocketSubscribers.add(this.compositionUtils);
	}

	/**
	 * Main initialization function called once the module is
	 * OK to start doing things. Principally, this is when
	 * the module should establish a connection to the device.
	 */
	async init(config: ResolumeArenaConfig, _isFirstInit: boolean): Promise<void> {
		this.config = config;
		await this.restartApis();
		this.subscribeFeedbacks();
		this.setupFeedback();
		this.setActionDefinitions(this.actions);
		this.setupPresets();
	}

	get actions(): CompanionActionDefinitions {
		var restApi = this.getRestApi.bind(this);
		var websocketApi = this.getWebsocketApi.bind(this);
		var oscApi = this.getOscApi.bind(this);
		var clipUtils = this.getClipUtils.bind(this);
		var layerUtils = this.getLayerUtils.bind(this);
		var actions: CompanionActionDefinitions = {
			bypassLayer: bypassLayer(restApi, oscApi),
			bypassLayerGroup: bypassLayerGroup(restApi, oscApi),
			clearAll: clearAllLayers(restApi, oscApi),
			clearLayer: clearLayer(restApi, oscApi),
			clearLayerGroup: clearLayerGroup(oscApi),
			compNextCol: compNextCol(restApi, oscApi),
			compPrevCol: compPrevCol(restApi, oscApi),
			custom: customOscCommand(oscApi, this),
			grpNextCol: layerGroupNextCol(restApi, oscApi),
			grpPrevCol: layerGroupPrevCol(restApi, oscApi),
			layNextCol: layerNextCol(restApi, oscApi),
			layPrevCol: layerPrevCol(restApi, oscApi),
			selectClip: selectClip(restApi, oscApi),
			selectLayer: selectLayer(restApi, oscApi),
			selectLayerGroup: selectLayerGroup(restApi, oscApi),
			soloLayer: soloLayer(restApi, oscApi),
			soloLayerGroup: soloLayerGroup(restApi, oscApi),
			tempoTap: tempoTap(restApi, oscApi),
			triggerClip: connectClip(restApi, oscApi),
			clipSpeedChange: clipSpeedChange(restApi, websocketApi, oscApi, clipUtils, this),
			triggerColumn: triggerColumn(restApi, oscApi),
			triggerLayerGroupColumn: triggerLayerGroupColumn(restApi, oscApi),
			layerOpacityChange: layerOpacityChange(restApi, websocketApi, oscApi, this),
			layerTransitionDurationChange: layerTransitionDurationChange(restApi, websocketApi, oscApi, layerUtils, this),
			layerGroupOpacityChange: layerGroupOpacityChange(restApi, websocketApi, oscApi, this),
			// TODO #46 feature request resolume layerGroupSpeedChange: layerGroupSpeedChange(restApi, websocketApi, oscApi, this),
			compositionOpacityChange: compositionOpacityChange(restApi, websocketApi, oscApi, this),
			compositionSpeedChange: compositionSpeedChange(restApi, websocketApi, oscApi, this),
		};
		return actions;
	}

	setupFeedback() {
		if (this.restApi) {
			this.setFeedbackDefinitions({
				connectedClip: {
					type: 'advanced',
					name: 'Connected Clip',
					options: [...getLayerOption(), ...getColumnOption()],
					callback: this.clipUtils.clipConnectedFeedbackCallback.bind(this.clipUtils),
					subscribe: this.clipUtils.clipConnectedFeedbackSubscribe.bind(this.clipUtils),
					unsubscribe: this.clipUtils.clipConnectedFeedbackUnsubscribe.bind(this.clipUtils),
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
					callback: this.clipUtils.clipDetailsFeedbackCallback.bind(this.clipUtils),
					subscribe: this.clipUtils.clipDetailsFeedbackSubscribe.bind(this.clipUtils),
					unsubscribe: this.clipUtils.clipDetailsFeedbackUnsubscribe.bind(this.clipUtils),
				},
				clipSpeed: {
					type: 'advanced',
					name: 'Clip Speed',
					options: [...getLayerOption(), ...getColumnOption()],
					callback: this.clipUtils.clipSpeedFeedbackCallback.bind(this.clipUtils),
					subscribe: this.clipUtils.clipSpeedFeedbackSubscribe.bind(this.clipUtils),
					unsubscribe: this.clipUtils.clipSpeedFeedbackUnsubscribe.bind(this.clipUtils),
				},
				compositionOpacity: {
					type: 'advanced',
					name: 'Composition Opacity',
					options: [],
					callback: this.compositionUtils.compositionOpacityFeedbackCallback.bind(this.compositionUtils),
					subscribe: this.compositionUtils.compositionOpacityFeedbackSubscribe.bind(this.compositionUtils),
					unsubscribe: this.compositionUtils.compositionOpacityFeedbackUnsubscribe.bind(this.compositionUtils),
				},
				compositionSpeed: {
					type: 'advanced',
					name: 'Composition Speed',
					options: [],
					callback: this.compositionUtils.compositionSpeedFeedbackCallback.bind(this.compositionUtils),
					subscribe: this.compositionUtils.compositionSpeedFeedbackSubscribe.bind(this.compositionUtils),
					unsubscribe: this.compositionUtils.compositionSpeedFeedbackUnsubscribe.bind(this.compositionUtils),
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
				layerOpacity: {
					type: 'advanced',
					name: 'Layer Opacity',
					options: [...getLayerOption()],
					callback: this.layerUtils.layerOpacityFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerOpacityFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerOpacityFeedbackUnsubscribe.bind(this.layerUtils),
				},
				layerTransitionDuration: {
					type: 'advanced',
					name: 'Layer Transition Duration',
					options: [...getLayerOption()],
					callback: this.layerUtils.layerTransitionDurationFeedbackCallback.bind(this.layerUtils),
					subscribe: this.layerUtils.layerTransitionDurationFeedbackSubscribe.bind(this.layerUtils),
					unsubscribe: this.layerUtils.layerTransitionDurationFeedbackUnsubscribe.bind(this.layerUtils),
				},
				layerGroupBypassed: {
					type: 'boolean',
					name: 'Layer Group Bypassed',
					defaultStyle: getDefaultStyleRed(),
					options: [...getLayerGroupOption()],
					callback: this.layerGroupUtils.layerGroupBypassedFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupBypassedFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupBypassedFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
				layerGroupSolo: {
					type: 'boolean',
					name: 'Layer Group Solo',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerGroupOption()],
					callback: this.layerGroupUtils.layerGroupSoloFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupSoloFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupSoloFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
				layerGroupActive: {
					type: 'boolean',
					name: 'Layer Group Active',
					defaultStyle: getDefaultStyleBlue(),
					options: [...getLayerGroupOption()],
					callback: this.layerGroupUtils.layerGroupActiveFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupActiveFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupActiveFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
				layerGroupSelected: {
					type: 'boolean',
					name: 'Layer Group Selected',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerGroupOption()],
					callback: this.layerGroupUtils.layerGroupSelectedFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupSelectedFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupSelectedFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
				layerGroupOpacity: {
					type: 'advanced',
					name: 'Layer Group Opacity',
					options: [...getLayerGroupOption()],
					callback: this.layerGroupUtils.layerGroupOpacityFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupOpacityFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupOpacityFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
				// TODO #46, resolume feature request
				// layerGroupSpeed: {
				// 	type: 'advanced',
				// 	name: 'Layer Group Speed',
				// 	options: [...getLayerGroupOption()],
				// 	callback: this.layerGroupUtils.layerGroupSpeedFeedbackCallback.bind(this.layerGroupUtils),
				// 	subscribe: this.layerGroupUtils.layerGroupSpeedFeedbackSubscribe.bind(this.layerGroupUtils),
				// 	unsubscribe: this.layerGroupUtils.layerGroupSpeedFeedbackUnsubscribe.bind(this.layerGroupUtils),
				// },
				columnSelected: {
					type: 'boolean',
					name: 'Column Selected',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getColumnOption()],
					callback: this.columnUtils.columnSelectedFeedbackCallback.bind(this.columnUtils),
					subscribe: this.columnUtils.columnSelectedFeedbackSubscribe.bind(this.columnUtils),
					unsubscribe: this.columnUtils.columnSelectedFeedbackUnsubscribe.bind(this.columnUtils),
				},
				layerGroupColumnsSelected: {
					type: 'boolean',
					name: 'Layer Group Column Selected',
					defaultStyle: getDefaultStyleGreen(),
					options: [...getLayerGroupOption(), ...getColumnOption()],
					callback: this.layerGroupUtils.layerGroupColumnsSelectedFeedbackCallback.bind(this.layerGroupUtils),
					subscribe: this.layerGroupUtils.layerGroupColumnsSelectedFeedbackSubscribe.bind(this.layerGroupUtils),
					unsubscribe: this.layerGroupUtils.layerGroupColumnsSelectedFeedbackUnsubscribe.bind(this.layerGroupUtils),
				},
			});
		} else {
			this.setFeedbackDefinitions({});
		}
	}

	setupPresets() {
		if (this.restApi) {
			this.setPresetDefinitions({
				triggerClip: {
					type: 'button',
					category: 'Clip',
					name: 'Trigger Clip',
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
					category: 'Layer',
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
					category: 'Layer',
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
					category: 'Layer',
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
				bypassLayerGroup: {
					type: 'button',
					category: 'Layer Group',
					name: 'Bypass Layer Group',
					style: {
						size: '14',
						text: 'Bypass Layer Group',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'bypassLayerGroup',
									options: {
										layerGroup: '1',
										bypass: 'toggle',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerGroupBypassed',
							options: {
								layerGroup: '1',
							},
							style: getDefaultStyleRed(),
						},
					],
				},
				soloLayerGroup: {
					type: 'button',
					category: 'Layer Group',
					name: 'Solo Layer Group',
					style: {
						size: '14',
						text: 'Solo Layer Group',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'soloLayerGroup',
									options: {
										layerGroup: '1',
										solo: 'toggle',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerGroupSolo',
							options: {
								layerGroup: '1',
							},
							style: getDefaultStyleGreen(),
						},
					],
				},
				clearLayerGroup: {
					type: 'button',
					category: 'Layer Group',
					name: 'Clear Layer Group',
					style: {
						size: '14',
						text: 'Clear Layer Group',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'clearLayerGroup',
									options: {
										layerGroup: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerGroupActive',
							options: {
								layerGroup: '1',
							},
							style: getDefaultStyleBlue(),
						},
					],
				},
				selectLayerGroup: {
					type: 'button',
					category: 'Layer Group',
					name: 'Select Layer Group',
					style: {
						size: '14',
						text: 'Select Layer Group',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'selectLayerGroup',
									options: {
										layerGroup: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerGroupSelected',
							options: {
								layerGroup: '1',
							},
							style: getDefaultStyleGreen(),
						},
					],
				},
				triggerColumn: {
					type: 'button',
					category: 'Column',
					name: 'Trigger Column',
					style: {
						size: '14',
						text: 'Trigger Column',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'triggerColumn',
									options: {
										column: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'columnSelected',
							options: {
								column: '1',
							},
							style: getDefaultStyleGreen(),
						},
					],
				},
				triggerLayerGroupColumn: {
					type: 'button',
					category: 'Layer Group',
					name: 'Trigger Layer Group Column',
					style: {
						size: '14',
						text: 'Trigger Layer Group Column',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'triggerLayerGroupColumn',
									options: {
										column: '1',
										layerGroup: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'layerGroupColumnsSelected',
							options: {
								column: '1',
								layerGroup: '1',
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
		await this.restartApis();
		this.subscribeFeedbacks();
		return Promise.resolve();
	}

	private async restartApis() {
		const config = this.config;
		if (config.webapiPort && config.useRest) {
			this.restApi = new ArenaRestApi(config.host, config.webapiPort, config.useSSL);
			this.websocketApi = new WebsocketApi(this, this.config);
			await this.websocketApi.waitForWebsocketReady();
		} else {
			this.restApi = null;
			this.websocketApi = null;
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
					// await this.clipUtils.poll();
					await this.layerUtils.poll();
					await this.layerGroupUtils.poll();
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
		return (
			// this.clipUtils.hasPollingSubscriptions() ||
			this.layerUtils.hasPollingSubscriptions() || this.layerGroupUtils.hasPollingSubscriptions()
		);
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

	getConfig(): ResolumeArenaConfig {
		return this.config;
	}

	getWebSocketSubscrivers(): Set<MessageSubscriber> {
		return this.websocketSubscribers;
	}

	getRestApi(): ArenaRestApi | null {
		return this.restApi;
	}

	getWebsocketApi(): WebsocketApi | null {
		return this.websocketApi;
	}

	getOscApi(): ArenaOscApi | null {
		return this.oscApi;
	}

	getClipUtils(): ClipUtils | null {
		return this.clipUtils;
	}
	getLayerUtils(): LayerUtils | null {
		return this.layerUtils;
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
			props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
		): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
			// upgrade_v1_0_4
			let updateActions = [];

			for (const action of props.actions) {
				switch (action.actionId) {
					case 'custom':
						if (action.options !== undefined && action.options.customCmd !== undefined) {
							action.options.customPath = action.options.customCmd;
							delete action.options.customCmd;
							updateActions.push(action);
						}
						break;
				}
			}

			return {
				updatedConfig: null,
				updatedActions: updateActions,
				updatedFeedbacks: [],
			};
		},
		function (
			_context: CompanionUpgradeContext<ResolumeArenaConfig>,
			props: CompanionStaticUpgradeProps<ResolumeArenaConfig>
		): CompanionStaticUpgradeResult<ResolumeArenaConfig> {
			// upgrade_v3_0_1
			let updateActions = [];

			for (const action of props.actions) {
				switch (action.actionId) {
					case 'custom':
						if (action.options !== undefined && action.options.relativeType === undefined) {
							action.options.relativeType = 'n';
							updateActions.push(action);
						}
						break;
				}
			}

			return {
				updatedConfig: null,
				updatedActions: updateActions,
				updatedFeedbacks: [],
			};
		},
	];
}

runEntrypoint(ResolumeArenaModuleInstance, getUpgradeScripts());
