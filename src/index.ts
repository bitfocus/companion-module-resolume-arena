import ArenaOscApi from './arena-api/osc';
import ArenaRestApi from './arena-api/rest';
import {configFields, ResolumeArenaConfig} from './config-fields';

import {InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField} from '@companion-module/base';
import {getActions} from './actions';
import {getApiFeedbacks} from './api-feedback';
import {getApiPresets} from './api-presets';
import {ClipUtils} from './domain/clip/clip-utils';
import {ColumnUtils} from './domain/columns/column-util';
import {CompositionUtils} from './domain/composition/composition-utils';
import {DeckUtils} from './domain/deck/deck-util';
import {LayerGroupUtils} from './domain/layer-groups/layer-group-util';
import {LayerUtils} from './domain/layers/layer-util';
import {getUpgradeScripts} from './upgrade-scripts';
import {MessageSubscriber, WebsocketInstance as WebsocketApi} from './websocket';
import {getApiVariables} from './api-variables';

export class ResolumeArenaModuleInstance extends InstanceBase<ResolumeArenaConfig> {
	private config!: ResolumeArenaConfig;
	public restApi: ArenaRestApi | null = null;
	private websocketApi: WebsocketApi | null = null;
	private oscApi: ArenaOscApi | null = null;

	private clipUtils: ClipUtils;
	private layerUtils: LayerUtils;
	private layerGroupUtils: LayerGroupUtils;
	private columnUtils: ColumnUtils;
	private compositionUtils: CompositionUtils;
	private deckUtils: DeckUtils;
	private websocketSubscribers: Set<MessageSubscriber> = new Set();

	constructor(internal: unknown) {
		super(internal);

		this.clipUtils = new ClipUtils(this);
		this.layerUtils = new LayerUtils(this);
		this.layerGroupUtils = new LayerGroupUtils(this);
		this.columnUtils = new ColumnUtils(this);
		this.compositionUtils = new CompositionUtils(this);
		this.deckUtils = new DeckUtils(this);
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
		this.setupVariables();
		this.setActionDefinitions(getActions(this));
		this.setupPresets();

		this.websocketSubscribers.add(this.layerUtils);
		this.websocketSubscribers.add(this.layerGroupUtils);
		this.websocketSubscribers.add(this.columnUtils);
		this.websocketSubscribers.add(this.clipUtils);
		this.websocketSubscribers.add(this.compositionUtils);
		this.websocketSubscribers.add(this.deckUtils);
	}

	setupFeedback() {
		if (this.restApi) {
			this.setFeedbackDefinitions(getApiFeedbacks(this));
		} else {
			this.setFeedbackDefinitions({});
		}
	}

	setupPresets() {
		if (this.restApi) {
			this.setPresetDefinitions(getApiPresets());
		} else {
			this.setPresetDefinitions({});
		}
	}

	setupVariables() {
		if (this.restApi) {
			this.setVariableDefinitions(getApiVariables());
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
			try {
				const productInfo = await this.restApi.productInfo()
				if ((productInfo).major) {
					this.updateStatus(InstanceStatus.Connecting);
					this.websocketApi = new WebsocketApi(this, this.config);
					this.websocketApi.waitForWebsocketReady();
				} else {
					this.updateStatus(InstanceStatus.ConnectionFailure);
				}
			} catch (error) {
				this.updateStatus(InstanceStatus.ConnectionFailure);
			}
			
		} else {
			this.restApi = null;
			this.websocketApi = null;
		}
		if (config.port) {
			this.oscApi = new ArenaOscApi(config.host, config.port, this.oscSend.bind(this));
			if(!this.restApi){
				this.updateStatus(InstanceStatus.Ok);
			}
		} else {
			this.oscApi = null;
		}
		this.setupFeedback();
		this.setActionDefinitions(getActions(this));
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
	getColumnUtils(): ColumnUtils | null {
		return this.columnUtils;
	}
	getLayerGroupUtils(): LayerGroupUtils | null {
		return this.layerGroupUtils;
	}
	getCompositionUtils(): CompositionUtils | null {
		return this.compositionUtils;
	}
	getDeckUtils(): DeckUtils | null {
		return this.deckUtils;
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

runEntrypoint(ResolumeArenaModuleInstance, getUpgradeScripts());
