import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compositionMasterChange } from '../../src/actions/composition/actions/composition-master-change'
import { compositionOpacityChange } from '../../src/actions/composition/actions/composition-opacity-change'
import { compositionSpeedChange } from '../../src/actions/composition/actions/composition-speed-change'
import { compositionVolumeChange } from '../../src/actions/composition/actions/composition-volume-change'
import { parameterStates, compositionState } from '../../src/state'

function makeWsApi() {
	return { setPath: vi.fn(), setParam: vi.fn(), triggerPath: vi.fn() }
}

function makeOscApi() {
	return { customOsc: vi.fn() }
}

function makeInstance(parseResult = '50') {
	return {
		log: vi.fn(),
		parseVariablesInString: vi.fn().mockResolvedValue(parseResult),
		resolveInt: vi.fn().mockImplementation((s: string) => { const n = parseInt(s, 10); return Promise.resolve(isNaN(n) ? undefined : n) }),
		resolveNumber: vi.fn().mockImplementation((s: string) => { const n = parseFloat(s); return Promise.resolve(isNaN(n) ? undefined : n) }),
	} as any
}

beforeEach(() => {
	parameterStates.set({})
	compositionState.set(undefined)
})

// ── compositionMasterChange ────────────────────────────────────────────────────

describe('compositionMasterChange', () => {
	it('set — calls setPath with inputValue/100', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('100')
		const action = compositionMasterChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '100' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/master', 1)
	})

	it('add — adds inputValue to current state', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/master': { value: 0.5 } } as any)
		const instance = makeInstance('10')
		const action = compositionMasterChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'add', value: '10' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/master', 0.5 + 0.1)
	})

	it('subtract — subtracts inputValue from current state', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/master': { value: 0.8 } } as any)
		const instance = makeInstance('20')
		const action = compositionMasterChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'subtract', value: '20' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/master', expect.closeTo(0.6, 5))
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('50')
		const action = compositionMasterChange(
			() => null,
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '50' } })
		expect(ws.setPath).not.toHaveBeenCalled()
	})

	it('returns an action definition with expected fields', () => {
		const action = compositionMasterChange(() => null, () => null, () => null, makeInstance())
		expect(action.name).toBe('Composition Master Change')
		expect(action.options).toHaveLength(2)
	})
})

// ── compositionSpeedChange ─────────────────────────────────────────────────────

describe('compositionSpeedChange — REST path', () => {
	it('set via REST calls setPath', async () => {
		const ws = makeWsApi()
		const instance = makeInstance('100')
		const action = compositionSpeedChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '100' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/speed', 1)
	})

	it('add via REST', async () => {
		const ws = makeWsApi()
		parameterStates.set({ '/composition/speed': { value: 0.5 } } as any)
		const instance = makeInstance('50')
		const action = compositionSpeedChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'add', value: '50' } })
		expect(ws.setPath).toHaveBeenCalledWith('/composition/speed', 1)
	})
})

describe('compositionSpeedChange — OSC path', () => {
	it('set via OSC calls customOsc', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('100')
		const action = compositionSpeedChange(
			() => null,
			() => null,
			() => osc as any,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '100' } })
		expect(osc.customOsc).toHaveBeenCalled()
	})

	it('add via OSC logs warning', async () => {
		const osc = makeOscApi()
		const instance = makeInstance('10')
		const action = compositionSpeedChange(
			() => null,
			() => null,
			() => osc as any,
			instance
		)
		await (action.callback as any)({ options: { action: 'add', value: '10' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
		expect(osc.customOsc).toHaveBeenCalled()
	})
})

// ── compositionOpacityChange ───────────────────────────────────────────────────

describe('compositionOpacityChange', () => {
	it('set — calls setParam with correct value', async () => {
		const ws = makeWsApi()
		compositionState.set({ video: { opacity: { id: 42 } } } as any)
		const instance = makeInstance('75')
		const action = compositionOpacityChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '75' } })
		expect(ws.setParam).toHaveBeenCalledWith('42', 0.75)
	})

	it('add — adds to current value', async () => {
		const ws = makeWsApi()
		compositionState.set({ video: { opacity: { id: 1 } } } as any)
		parameterStates.set({ '/composition/video/opacity': { value: 0.5 } } as any)
		const instance = makeInstance('25')
		const action = compositionOpacityChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'add', value: '25' } })
		expect(ws.setParam).toHaveBeenCalledWith('1', 0.75)
	})

	it('does nothing when restApi returns null', async () => {
		const ws = makeWsApi()
		const action = compositionOpacityChange(
			() => null,
			() => ws as any,
			() => null,
			makeInstance()
		)
		await (action.callback as any)({ options: { action: 'set', value: '50' } })
		expect(ws.setParam).not.toHaveBeenCalled()
	})

	it('does not call setParam when composition has no opacity id (#140)', async () => {
		const ws = makeWsApi()
		compositionState.set(undefined)
		const instance = makeInstance('50')
		const action = compositionOpacityChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '50' } })
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})

// ── compositionVolumeChange ────────────────────────────────────────────────────

describe('compositionVolumeChange', () => {
	it('set — calls setParam with raw value (not /100)', async () => {
		const ws = makeWsApi()
		compositionState.set({ audio: { volume: { id: 99 } } } as any)
		const instance = makeInstance('-6')
		const action = compositionVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '-6' } })
		expect(ws.setParam).toHaveBeenCalledWith('99', -6)
	})

	it('add — adds to current value', async () => {
		const ws = makeWsApi()
		compositionState.set({ audio: { volume: { id: 5 } } } as any)
		parameterStates.set({ '/composition/audio/volume': { value: -12 } } as any)
		const instance = makeInstance('6')
		const action = compositionVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'add', value: '6' } })
		expect(ws.setParam).toHaveBeenCalledWith('5', -6)
	})

	it('subtract — subtracts from current value', async () => {
		const ws = makeWsApi()
		compositionState.set({ audio: { volume: { id: 5 } } } as any)
		parameterStates.set({ '/composition/audio/volume': { value: -6 } } as any)
		const instance = makeInstance('6')
		const action = compositionVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'subtract', value: '6' } })
		expect(ws.setParam).toHaveBeenCalledWith('5', -12)
	})

	it('does not call setParam when composition has no volume id (#140)', async () => {
		const ws = makeWsApi()
		compositionState.set(undefined)
		const instance = makeInstance('-6')
		const action = compositionVolumeChange(
			() => ({} as any),
			() => ws as any,
			() => null,
			instance
		)
		await (action.callback as any)({ options: { action: 'set', value: '-6' } })
		expect(ws.setParam).not.toHaveBeenCalled()
		expect(instance.log).toHaveBeenCalledWith('warn', expect.stringContaining('paramId should not be undefined'))
	})
})
