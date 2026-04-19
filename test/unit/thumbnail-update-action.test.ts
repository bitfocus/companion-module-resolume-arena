import { describe, it, expect, vi } from 'vitest'
import { thumbnailUpdate } from '../../src/actions/clip/actions/thumbnail-update'

function makeWebsocketApi() {
	return { subscribePath: vi.fn() }
}

function makeInstance(parseResult = '1') {
	return {
		log: vi.fn(),
		parseVariablesInString: vi.fn().mockResolvedValue(parseResult),
	} as any
}

describe('thumbnailUpdate action definition', () => {
	it('has the correct action name', () => {
		const action = thumbnailUpdate(() => null, makeInstance())
		expect(action.name).toBe('Refresh Clip Thumbnail')
	})

	it('has two options (layer and column)', () => {
		const action = thumbnailUpdate(() => null, makeInstance())
		expect(action.options).toHaveLength(2)
		const ids = action.options.map((o: any) => o.id)
		expect(ids).toContain('layer')
		expect(ids).toContain('column')
	})
})

describe('thumbnailUpdate callback — WebSocket available', () => {
	it('calls subscribePath with the correct clip thumbnail path', async () => {
		const ws = makeWebsocketApi()
		let callIndex = 0
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn().mockImplementation(() =>
				Promise.resolve(callIndex++ === 0 ? '2' : '3')
			),
		} as any
		const action = thumbnailUpdate(() => ws as any, instance)
		await (action.callback as any)({ options: { layer: '2', column: '3' } })
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/2/clips/3/thumbnail')
	})

	it('uses parsed variable values for layer and column', async () => {
		const ws = makeWebsocketApi()
		let callIndex = 0
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn().mockImplementation(() =>
				Promise.resolve(callIndex++ === 0 ? '5' : '1')
			),
		} as any
		const action = thumbnailUpdate(() => ws as any, instance)
		await (action.callback as any)({ options: { layer: '$(var:layer)', column: '1' } })
		expect(ws.subscribePath).toHaveBeenCalledWith('/composition/layers/5/clips/1/thumbnail')
	})
})

describe('thumbnailUpdate callback — no WebSocket (OSC-only mode)', () => {
	it('logs a warning and does not throw', async () => {
		const instance = makeInstance('1')
		const action = thumbnailUpdate(() => null, instance)
		await (action.callback as any)({ options: { layer: '1', column: '1' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
	})

	it('does not call subscribePath when websocket is null', async () => {
		const ws = makeWebsocketApi()
		const instance = makeInstance('1')
		const action = thumbnailUpdate(() => null, instance)
		await (action.callback as any)({ options: { layer: '1', column: '1' } })
		expect(ws.subscribePath).not.toHaveBeenCalled()
	})
})
