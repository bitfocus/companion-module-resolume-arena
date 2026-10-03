import { describe, it, expect } from 'vitest'
import { InstanceBase } from '@companion-module/base'
import ModuleInstance, { ResolumeArenaModuleInstance, UpgradeScripts } from '../../src/index.js'
import { makeModuleInstance } from './helpers/host-context.js'

describe('module entrypoint (API 2.x)', () => {
	it('default-exports the instance class', () => {
		expect(typeof ModuleInstance).toBe('function')
		expect(Object.getPrototypeOf(ModuleInstance)).toBe(InstanceBase)
	})

	it('keeps the named export for internal imports', () => {
		expect(ResolumeArenaModuleInstance).toBe(ModuleInstance)
	})

	it('exports all upgrade scripts as UpgradeScripts', () => {
		expect(Array.isArray(UpgradeScripts)).toBe(true)
		expect(UpgradeScripts).toHaveLength(6)
		for (const script of UpgradeScripts) {
			expect(typeof script).toBe('function')
		}
	})
})

describe('module instance against the API 2.x host', () => {
	// No REST, OSC send port or OSC listener configured: nothing connects
	const offlineConfig = {
		host: '127.0.0.1',
		port: 0,
		webapiPort: 0,
		useSSL: false,
		useRest: false,
		useCroppedThumbs: false,
		useOscListener: false,
		oscRxPort: 0,
	}

	it('registers its definitions in the shapes the host expects', async () => {
		const { instance, host } = makeModuleInstance()
		await instance.init(offlineConfig, true)

		expect(host.setActionDefinitions).toHaveBeenCalledTimes(1)
		expect(host.setFeedbackDefinitions).toHaveBeenCalledTimes(1)

		// variables: an object keyed by variable id, no longer an array
		const [variables] = host.setVariableDefinitions.mock.calls[0]
		expect(Array.isArray(variables)).toBe(false)

		// presets: (structure, presets)
		expect(host.setPresetDefinitions.mock.calls[0]).toHaveLength(2)
		expect(Array.isArray(host.setPresetDefinitions.mock.calls[0][0])).toBe(true)

		await instance.destroy()
	})

	it('keys the registered variables by id when the OSC listener is enabled', () => {
		const { instance, host } = makeModuleInstance()
		;(instance as any).config = { ...offlineConfig, useOscListener: true }
		instance.setupVariables()
		const [variables] = host.setVariableDefinitions.mock.calls[0]
		expect(variables.osc_active_column).toEqual({ name: 'OSC / Active Column' })
		expect(variables.osc_layer_1_elapsed).toEqual({ name: 'OSC Layer 1 / Elapsed Time' })
	})

	it('re-subscribes feedbacks after a config update by rechecking all of them', async () => {
		const { instance, host } = makeModuleInstance()
		await instance.init(offlineConfig, true)
		const subscriptions = instance.getFeedbackSubscriptions()
		subscriptions.set('fb1', '{"layer":"1"}', { layer: '1' })
		host.checkAllFeedbacks.mockClear()

		await instance.configUpdated(offlineConfig)

		expect(host.checkAllFeedbacks).toHaveBeenCalledTimes(1)
		expect(subscriptions.get('fb1')?.stale).toBe(true)
		await instance.destroy()
	})
})
