import ArenaOscApi from './arena-api/osc.js'
import ArenaRestApi from './arena-api/rest.js'
import { configFields, ResolumeArenaConfig } from './config-fields.js'

import { InstanceBase, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { getActions } from './actions.js'
import { getApiFeedbacks } from './api-feedback.js'
import { getApiPresetBundles } from './api-presets.js'
import { ClipUtils } from './domain/clip/clip-utils.js'
import { ColumnUtils } from './domain/columns/column-util.js'
import { CompositionUtils } from './domain/composition/composition-utils.js'
import { DeckUtils } from './domain/deck/deck-util.js'
import { LayerGroupUtils } from './domain/layer-groups/layer-group-util.js'
import { LayerUtils } from './domain/layers/layer-util.js'
import { EffectUtils } from './domain/effects/effect-utils.js'
import { MessageSubscriber, WebsocketInstance as WebsocketApi } from './websocket.js'
import { getApiVariables } from './api-variables.js'
import { ArenaOscListener } from './osc-listener.js'
import { OscState } from './osc-state.js'
import { getAllOscVariables } from './variables/osc-variables.js'
import { getAllWsVariables } from './variables/ws-variables.js'
import { getOscTransportPresetBundle } from './presets/osc-transport/oscTransportPresets.js'
import { getOscTransportFeedbacks } from './feedbacks/osc-transport/oscTransportFeedbacks.js'

export class ResolumeArenaModuleInstance extends InstanceBase {
	private config!: ResolumeArenaConfig
	public restApi: ArenaRestApi | null = null
	private websocketApi: WebsocketApi | null = null
	private oscApi: ArenaOscApi | null = null
	private oscListener: ArenaOscListener | null = null
	private oscState: OscState

	public clipUtils: ClipUtils
	private layerUtils: LayerUtils
	private layerGroupUtils: LayerGroupUtils
	private columnUtils: ColumnUtils
	private compositionUtils: CompositionUtils
	private deckUtils: DeckUtils
	private effectUtils: EffectUtils
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
		this.effectUtils = new EffectUtils(this)
	}

	async init(config: any, _isFirstInit: boolean): Promise<void> {
		this.config = config as ResolumeArenaConfig

		await this.restartApis()

		this.websocketSubscribers.add(this.layerUtils)
		this.websocketSubscribers.add(this.layerGroupUtils)
		this.websocketSubscribers.add(this.columnUtils)
		this.websocketSubscribers.add(this.clipUtils)
		this.websocketSubscribers.add(this.compositionUtils)
		this.websocketSubscribers.add(this.deckUtils)
		this.websocketSubscribers.add(this.effectUtils)
	}

	setupFeedback(): void {
		const feedbacks = {}
		if (this.restApi) {
			Object.assign(feedbacks, getApiFeedbacks(this))
		}
		// OSC transport feedbacks (progress bar, active column) require the listener
		if (this.config?.useOscListener) {
			Object.assign(feedbacks, getOscTransportFeedbacks(this))
		}
		this.setFeedbackDefinitions(feedbacks)
	}

	setupPresets(): void {
		// Each preset factory now returns { section, presets }; aggregate into
		// the two-arg setPresetDefinitions(structure, presets) call. Section
		// order inside structure is logical, but Companion 4.3 re-sorts
		// top-level sections alphabetically by display name anyway. Sub-groups
		// within each section DO render in the array order the factories
		// produce.
		const structure: any[] = []
		const presets: Record<string, any> = {}

		if (this.restApi) {
			const rest = getApiPresetBundles()
			for (const sec of rest.sections) structure.push(sec)
			Object.assign(presets, rest.presets)
		}
		// OSC transport presets reference listener-dependent feedbacks (progress bar, etc.),
		// so only register them when the listener is enabled.
		if (this.config?.useOscListener) {
			const osc = getOscTransportPresetBundle(this.label, this.oscState.getRegisteredLayers())
			if (osc.section.definitions.length) structure.push(osc.section)
			Object.assign(presets, osc.presets)
		}

		this.setPresetDefinitions(structure as any, presets as any)
	}

	setupVariables(): void {
		const variables: Array<{variableId: string; name: string}> = []
		if (this.restApi) {
			variables.push(...getApiVariables())
			variables.push(...this.clipUtils.getClipNameVariableDefinitions())
			variables.push(...getAllWsVariables())
		}
		// OSC variables require the listener to populate them
		if (this.config?.useOscListener) {
			variables.push(...getAllOscVariables(this.oscState.getRegisteredLayers()))
		}
		// API 2.0 requires object keyed by variableId, not array
		const variableDefs: Record<string, {name: string}> = {}
		for (const v of variables) {
			variableDefs[v.variableId] = {name: v.name}
		}
		this.setVariableDefinitions(variableDefs as any)
	}

	registerOscVariables(): void {
		this.setupVariables()
		this.setupPresets()
	}

	async configUpdated(config: any): Promise<void> {
		this.config = config as ResolumeArenaConfig
		await this.restartApis()
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
		this.oscState.stopPeriodicRefresh()
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

	getEffectUtils(): EffectUtils {
		return this.effectUtils
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


export default ResolumeArenaModuleInstance
export { UpgradeScripts } from './upgrade-scripts.js'
