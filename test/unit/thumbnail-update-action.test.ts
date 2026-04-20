import { describe, it, expect, vi } from 'vitest'
import { thumbnailUpdate } from '../../src/actions/clip/actions/thumbnail-update'

function makeClipUtils() {
	return { refreshThumbnail: vi.fn().mockResolvedValue(undefined) }
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

describe('thumbnailUpdate callback — REST available', () => {
	it('calls refreshThumbnail with the correct layer and column', async () => {
		const utils = makeClipUtils()
		let callIndex = 0
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn().mockImplementation(() =>
				Promise.resolve(callIndex++ === 0 ? '2' : '3')
			),
		} as any
		const action = thumbnailUpdate(() => utils as any, instance)
		await (action.callback as any)({ options: { layer: '2', column: '3' } })
		expect(utils.refreshThumbnail).toHaveBeenCalledWith(2, 3)
	})

	it('uses parsed variable values for layer and column', async () => {
		const utils = makeClipUtils()
		let callIndex = 0
		const instance = {
			log: vi.fn(),
			parseVariablesInString: vi.fn().mockImplementation(() =>
				Promise.resolve(callIndex++ === 0 ? '5' : '1')
			),
		} as any
		const action = thumbnailUpdate(() => utils as any, instance)
		await (action.callback as any)({ options: { layer: '$(var:layer)', column: '1' } })
		expect(utils.refreshThumbnail).toHaveBeenCalledWith(5, 1)
	})
})

describe('thumbnailUpdate callback — no ClipUtils (OSC-only mode)', () => {
	it('logs a warning and does not throw', async () => {
		const instance = makeInstance('1')
		const action = thumbnailUpdate(() => null, instance)
		await (action.callback as any)({ options: { layer: '1', column: '1' } })
		expect(instance.log).toHaveBeenCalledWith('warn', expect.any(String))
	})

	it('does not call refreshThumbnail when clipUtils is null', async () => {
		const utils = makeClipUtils()
		const instance = makeInstance('1')
		const action = thumbnailUpdate(() => null, instance)
		await (action.callback as any)({ options: { layer: '1', column: '1' } })
		expect(utils.refreshThumbnail).not.toHaveBeenCalled()
	})
})
