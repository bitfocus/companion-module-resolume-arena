import type {CompanionFeedbackInfo, CompanionOptionValues} from '@companion-module/base';

interface SubscriptionEntry {
	/** Serialized options the feedback subscribed with */
	key: string;
	options: CompanionOptionValues;
	/** Set when the connection was replaced: the next callback subscribes again */
	stale: boolean;
}

/**
 * Remembers which feedback instances have subscribed, and with which options.
 *
 * It lives on the module instance rather than in the feedback definitions, because the
 * definitions (and with them the wrappers below) are rebuilt whenever the composition changes.
 */
export class FeedbackSubscriptionRegistry {
	private readonly entries = new Map<string, SubscriptionEntry>();

	get size(): number {
		return this.entries.size;
	}

	get(feedbackId: string): SubscriptionEntry | undefined {
		return this.entries.get(feedbackId);
	}

	set(feedbackId: string, key: string, options: CompanionOptionValues): void {
		this.entries.set(feedbackId, {key, options, stale: false});
	}

	delete(feedbackId: string): void {
		this.entries.delete(feedbackId);
	}

	/** Makes every known feedback subscribe again on its next callback, e.g. after a reconnect. */
	invalidate(): void {
		for (const entry of this.entries.values()) {
			entry.stale = true;
		}
	}
}

export interface SubscriptionHooks<TFeedback extends CompanionFeedbackInfo, TContext, TResult> {
	callback: (feedback: TFeedback, context: TContext) => TResult | Promise<TResult>;
	subscribe: (feedback: CompanionFeedbackInfo) => void | Promise<void>;
	unsubscribe?: (feedback: CompanionFeedbackInfo) => void | Promise<void>;
}

/**
 * Module API 2.0 removed the feedback `subscribe` callback: `callback` is now the only method invoked
 * when a feedback is added or its options change, and `unsubscribe` only runs once it is removed.
 *
 * This restores the subscribe/unsubscribe pairing on top of that lifecycle. `subscribe` runs before
 * the first callback of a feedback, and again (after an `unsubscribe` for the old options) whenever
 * its resolved options change — which now also covers options driven by variables or expressions.
 */
export function withSubscription<TFeedback extends CompanionFeedbackInfo, TContext, TResult>(
	registry: FeedbackSubscriptionRegistry,
	hooks: SubscriptionHooks<TFeedback, TContext, TResult>
): {
	callback: (feedback: TFeedback, context: TContext) => Promise<TResult>;
	unsubscribe: (feedback: CompanionFeedbackInfo) => Promise<void>;
} {
	return {
		callback: async (feedback, context) => {
			const key = JSON.stringify(feedback.options);
			const previous = registry.get(feedback.id);
			if (!previous || previous.stale || previous.key !== key) {
				// Register first, so an overlapping callback for the same feedback does not subscribe twice
				registry.set(feedback.id, key, feedback.options);
				if (previous && previous.key !== key) {
					await hooks.unsubscribe?.({...feedback, options: previous.options});
				}
				await hooks.subscribe(feedback);
			}
			return hooks.callback(feedback, context);
		},
		unsubscribe: async (feedback) => {
			const previous = registry.get(feedback.id);
			if (!previous) return;
			registry.delete(feedback.id);
			await hooks.unsubscribe?.({...feedback, options: previous.options});
		},
	};
}
