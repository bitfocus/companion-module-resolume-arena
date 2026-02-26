import ArenaOscApi from './arena-api/osc'
import ArenaRestApi from './arena-api/rest'
import { configFields, ResolumeArenaConfig } from './config-fields'

import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { getActions } from './actions'
import { getApiFeedbacks } from './api-feedback'
import { getApiPresets } from './api-presets'
import { ClipUtils } from './domain/clip/clip-utils'
import { ColumnUtils } from './domain/columns/column-util'
import { CompositionUtils } from './domain/composition/composition-utils'
import { DeckUtils } from './domain/deck/deck-util'
import { LayerGroupUtils } from './domain/layer-groups/layer-group-util'
import { LayerUtils } from './domain/layers/layer-util'
import { getUpgradeScripts } from './upgrade-scripts'
import { MessageSubscriber, WebsocketInstance as WebsocketApi } from './websocket'
import { getApiVariables } from './api-variables'
import { ArenaOscListener } from './osc-listener'
import { OscState } from './osc-state'
import { getAllOscVariables } from './variables/osc-variables'
import { getOscTransportPresets } from './presets/osc-transport/oscTransportPresets'
import { getOscTransportFeedbacks } from './feedbacks/osc-transport/oscTransportFeedbacks'

export class ResolumeArenaModuleInstance extends InstanceBase<ResolumeArenaConfig> {
	private config!: ResolumeArenaConfig
	public restApi: ArenaRestApi | null = null
	private websocketApi: WebsocketApi | null = null
	private oscApi: ArenaOscApi | null = null
	private oscListener: ArenaOscListener | null = null
	private oscState: OscState

	private clipUtils: ClipUtils
	private layerUtils: LayerUtils
	private layerGroupUtils: LayerGroupUtils
	private columnUtils: ColumnUtils
	private compositionUtils: CompositionUtils
	private deckUtils: DeckUtils
	private websocketSubscribers: Set<MessageSubscriber> = new Set()

	constructor(internal: unknown) {
		super(internal)

		this.oscState = new OscState(this)
		this.clipUtils = new ClipUtils(this)
		this.layerUtils = new LayerUtils(this)
		this.layerGroupUtils = new LayerGroupUtils(this)
		this.columnUtils = new ColumnUtils(this)
		this.compositionUtils = new CompositionUtils(this)
		this.deckUtils = new DeckUtils(this)
	}

	async init(config: ResolumeArenaConfig, _isFirstInit: boolean): Promise<void> {
		this.config = config

		await this.restartApis()
		this.subscribeFeedbacks()
		this.setupFeedback()
		this.setupVariables()
		this.setActionDefinitions(getActions(this))
		this.setupPresets()

		this.websocketSubscribers.add(this.layerUtils)
		this.websocketSubscribers.add(this.layerGroupUtils)
		this.websocketSubscribers.add(this.columnUtils)
		this.websocketSubscribers.add(this.clipUtils)
		this.websocketSubscribers.add(this.compositionUtils)
		this.websocketSubscribers.add(this.deckUtils)
	}

	setupFeedback(): void {
		const feedbacks = {}
		if (this.restApi) {
			Object.assign(feedbacks, getApiFeedbacks(this))
		}
		if (this.config?.useOscListener) {
			Object.assign(feedbacks, getOscTransportFeedbacks(this))
		}
		this.setFeedbackDefinitions(feedbacks)
	}

	setupPresets(): void {
		const presets = {}
		if (this.restApi) {
			Object.assign(presets, getApiPresets())
		}
		if (this.config?.useOscListener) {
			Object.assign(presets, getOscTransportPresets(this.label, this.oscState.getRegisteredLayers()))
		}
		this.setPresetDefinitions(presets)
	}

	setupVariables(): void {
		const variables = []
		if (this.restApi) {
			variables.push(...getApiVariables())
		}
		if (this.config?.useOscListener) {
			variables.push(...getAllOscVariables(this.oscState.getRegisteredLayers()))
		}
		this.setVariableDefinitions(variables)
	}

	registerOscVariables(): void {
		this.setupVariables()
		this.setupPresets()
	}

	async configUpdated(config: ResolumeArenaConfig): Promise<void> {
		this.config = config
		await this.restartApis()
		this.subscribeFeedbacks()
		return Promise.resolve()
	}

	async restartApis(): Promise<void> {
		const config = this.config

		if (this.oscListener) {
			this.oscListener.destroy()
			this.oscListener = null
		}
		if (this.websocketApi) {
			await this.websocketApi.destroy()
			this.websocketApi = null
		}
		this.oscState.clear()

		if (config.webapiPort && config.useRest) {
			this.restApi = new ArenaRestApi(config.host, config.webapiPort, config.useSSL)
			try {
				this.updateStatus(InstanceStatus.Connecting)
				const productInfo = await this.restApi.productInfo()
				this.log('info', 'productInfo: ' + JSON.stringify(productInfo))
				if ((productInfo as { major?: number }).major) {
					this.websocketApi = new WebsocketApi(this, this.config)
					this.websocketApi.waitForWebsocketReady()
				} else {
					this.log('error', 'productInfo wrong, will retry in 5 seconds')
					this.updateStatus(InstanceStatus.ConnectionFailure)
					setTimeout(() => {
						void this.restartApis()
					}, 5000)
				}
			} catch (error) {
				this.log('error', 'productInfo failed, will retry in 5 seconds: ' + error)
				this.updateStatus(InstanceStatus.ConnectionFailure)
				setTimeout(() => {
					void this.restartApis()
				}, 5000)
			}
		} else {
			this.restApi = null
			if (this.websocketApi as WebsocketApi | null) {
				await this.websocketApi!.destroy()
			}
			this.websocketApi = null
		}

		if (config.port) {
			this.oscApi = new ArenaOscApi(config.host, config.port, this.oscSend.bind(this))
			if (!this.restApi && !config.useOscListener) {
				this.updateStatus(InstanceStatus.Ok)
			}
		} else {
			this.oscApi = null
		}

		if (config.useOscListener && config.oscRxPort) {
			this.oscListener = new ArenaOscListener(config.oscRxPort, this)
			this.oscListener.start()
			this.oscState.startPeriodicRefresh()
		}

		this.setupFeedback()
		this.setupVariables()
		this.setActionDefinitions(getActions(this))
		this.setupPresets()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return configFields()
	}

	getConfig(): ResolumeArenaConfig {
		return this.config
	}

	getWebSocketSubscribers(): Set<MessageSubscriber> {
		return this.websocketSubscribers
	}

	getRestApi(): ArenaRestApi | null {
		return this.restApi
	}

	getWebsocketApi(): WebsocketApi | null {
		return this.websocketApi
	}

	getOscApi(): ArenaOscApi | null {
		return this.oscApi
	}

	getClipUtils(): ClipUtils | null {
		return this.clipUtils
	}

	getLayerUtils(): LayerUtils | null {
		return this.layerUtils
	}

	getColumnUtils(): ColumnUtils | null {
		return this.columnUtils
	}

	getLayerGroupUtils(): LayerGroupUtils | null {
		return this.layerGroupUtils
	}

	getCompositionUtils(): CompositionUtils | null {
		return this.compositionUtils
	}

	getDeckUtils(): DeckUtils | null {
		return this.deckUtils
	}

	handleOscInput(address: string, value: number | string, _args: unknown[]): void {
		this.oscState.handleMessage(address, value)
	}

	isOscListenerActive(): boolean {
		return this.oscListener?.isActive() ?? false
	}

	getOscState(): OscState {
		return this.oscState
	}

	getOscListener(): ArenaOscListener | null {
		return this.oscListener
	}

	async destroy(): Promise<void> {
		if (this.websocketApi) {
			await this.websocketApi.destroy()
			this.websocketApi = null
		}
		this.restApi = null
		this.oscApi = null
		if (this.oscListener) {
			this.oscListener.destroy()
			this.oscListener = null
		}
		this.oscState.destroy()
	}
}

runEntrypoint(ResolumeArenaModuleInstance, getUpgradeScripts())
