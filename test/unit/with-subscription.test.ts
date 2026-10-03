import { describe, it, expect, vi } from 'vitest'
import { FeedbackSubscriptionRegistry, withSubscription } from '../../src/feedbacks/with-subscription.js'

function makeFeedback(id: string, options: Record<string, any>) {
	return { id, controlId: 'c1', feedbackId: 'test', type: 'boolean', options, previousOptions: null } as any
}

function setup(registry = new FeedbackSubscriptionRegistry()) {
	const hooks = {
		callback: vi.fn().mockResolvedValue(true),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
	}
	return { registry, hooks, wrapped: withSubscription(registry, hooks) }
}

const context = { type: 'feedback' } as any

describe('withSubscription', () => {
	it('subscribes on the first callback and returns the callback result', async () => {
		const { hooks, wrapped } = setup()
		const feedback = makeFeedback('a', { layer: '1' })
		const result = await wrapped.callback(feedback, context)
		expect(result).toBe(true)
		expect(hooks.subscribe).toHaveBeenCalledTimes(1)
		expect(hooks.subscribe).toHaveBeenCalledWith(feedback)
		expect(hooks.callback).toHaveBeenCalledWith(feedback, context)
	})

	it('subscribes before running the callback', async () => {
		const order: string[] = []
		const wrapped = withSubscription(new FeedbackSubscriptionRegistry(), {
			subscribe: async () => {
				await Promise.resolve()
				order.push('subscribe')
			},
			callback: () => {
				order.push('callback')
				return true
			},
		})
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		expect(order).toEqual(['subscribe', 'callback'])
	})

	it('does not subscribe again while the options are unchanged', async () => {
		const { hooks, wrapped } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		expect(hooks.subscribe).toHaveBeenCalledTimes(1)
		expect(hooks.unsubscribe).not.toHaveBeenCalled()
		expect(hooks.callback).toHaveBeenCalledTimes(3)
	})

	it('tracks feedbacks independently by id', async () => {
		const { hooks, wrapped } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.callback(makeFeedback('b', { layer: '1' }), context)
		expect(hooks.subscribe).toHaveBeenCalledTimes(2)
	})

	it('moves the subscription when the options change', async () => {
		const { hooks, wrapped } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		const changed = makeFeedback('a', { layer: '2' })
		await wrapped.callback(changed, context)

		expect(hooks.unsubscribe).toHaveBeenCalledTimes(1)
		expect(hooks.unsubscribe.mock.calls[0][0].id).toBe('a')
		expect(hooks.unsubscribe.mock.calls[0][0].options).toEqual({ layer: '1' })
		expect(hooks.subscribe).toHaveBeenCalledTimes(2)
		expect(hooks.subscribe).toHaveBeenLastCalledWith(changed)
		expect(hooks.unsubscribe.mock.invocationCallOrder[0]).toBeLessThan(hooks.subscribe.mock.invocationCallOrder[1])
	})

	it('unsubscribes with the options that were subscribed, and forgets the feedback', async () => {
		const { hooks, wrapped, registry } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.unsubscribe(makeFeedback('a', { layer: '1' }))
		expect(hooks.unsubscribe).toHaveBeenCalledTimes(1)
		expect(hooks.unsubscribe.mock.calls[0][0].options).toEqual({ layer: '1' })
		expect(registry.size).toBe(0)

		// a later callback (feedback re-enabled) subscribes again
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		expect(hooks.subscribe).toHaveBeenCalledTimes(2)
	})

	it('does not call unsubscribe for a feedback that never subscribed', async () => {
		const { hooks, wrapped } = setup()
		await wrapped.unsubscribe(makeFeedback('a', { layer: '1' }))
		expect(hooks.unsubscribe).not.toHaveBeenCalled()
	})

	it('survives definitions being rebuilt, because the registry outlives the wrapper', async () => {
		const registry = new FeedbackSubscriptionRegistry()
		const first = setup(registry)
		await first.wrapped.callback(makeFeedback('a', { layer: '1' }), context)

		const rebuilt = setup(registry)
		await rebuilt.wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		expect(rebuilt.hooks.subscribe).not.toHaveBeenCalled()
	})

	it('subscribes again, once, after the registry is invalidated (new connection)', async () => {
		const { hooks, wrapped, registry } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		registry.invalidate()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		expect(hooks.subscribe).toHaveBeenCalledTimes(2)
		expect(hooks.unsubscribe).not.toHaveBeenCalled()
	})

	it('still unsubscribes a feedback that is removed while invalidated', async () => {
		const { hooks, wrapped, registry } = setup()
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		registry.invalidate()
		await wrapped.unsubscribe(makeFeedback('a', { layer: '1' }))
		expect(hooks.unsubscribe).toHaveBeenCalledTimes(1)
		expect(registry.size).toBe(0)
	})

	it('works without an unsubscribe hook', async () => {
		const subscribe = vi.fn()
		const wrapped = withSubscription(new FeedbackSubscriptionRegistry(), { subscribe, callback: () => ({ text: 'x' }) })
		await wrapped.callback(makeFeedback('a', { layer: '1' }), context)
		await wrapped.callback(makeFeedback('a', { layer: '2' }), context)
		await expect(wrapped.unsubscribe(makeFeedback('a', { layer: '2' }))).resolves.toBeUndefined()
		expect(subscribe).toHaveBeenCalledTimes(2)
	})
})
