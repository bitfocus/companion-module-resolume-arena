import { describe, it, expect, vi } from 'vitest'
import { disconnectAll } from '../../src/actions/composition/actions/disconnect-all'

describe('disconnectAll — REST path', () => {
	it('triggers /composition/disconnect-all via websocket', async () => {
		const ws = { triggerPath: vi.fn() }
		const action = disconnectAll(() => ({} as any), () => ws as any, () => null)
		await (action.callback as any)({ options: {} })
		expect(ws.triggerPath).toHaveBeenCalledWith('/composition/disconnect-all')
	})
})

describe('disconnectAll — OSC path', () => {
	it('calls oscApi.clearAllLayers when REST api is unavailable', async () => {
		const osc = { clearAllLayers: vi.fn() }
		const action = disconnectAll(() => null, () => null, () => osc as any)
		await (action.callback as any)({ options: {} })
		expect(osc.clearAllLayers).toHaveBeenCalled()
	})

	it('does not call oscApi when REST api is available', async () => {
		const osc = { clearAllLayers: vi.fn() }
		const ws = { triggerPath: vi.fn() }
		const action = disconnectAll(() => ({} as any), () => ws as any, () => osc as any)
		await (action.callback as any)({ options: {} })
		expect(osc.clearAllLayers).not.toHaveBeenCalled()
	})
})
