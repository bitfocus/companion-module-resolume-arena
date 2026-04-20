# Open Issues — Workload Assessment

Each issue gets its own branch: `fix/<number>-short-slug` or `feat/<number>-short-slug`.

---

## Bugs (prioritize first)

### ~~[#149](https://github.com/bitfocus/companion-module-resolume-arena/issues/149) — WebSocket readyState checks always undefined~~ ✅ Merged — [PR #163](https://github.com/bitfocus/companion-module-resolume-arena/pull/163)

Replaced `this.ws?.OPEN` / `socket?.OPEN` instance lookups with `WebSocket.OPEN` static. Fixed `waitForOpenConnection` and `updateNeededSubscribers`.

---

### ~~[#142](https://github.com/bitfocus/companion-module-resolume-arena/issues/142) — `previewedClipName` variable always empty~~ ✅ Merged — [PR #167](https://github.com/bitfocus/companion-module-resolume-arena/pull/167)

Root cause: `clipConnectedFeedbackCallback` reads clip name from `parameterStates`, but `/name` was only subscribed when a separate `clipDetails` feedback existed for the same slot. Fix: co-subscribe `/name` alongside `/connect` in `clipConnectedWebsocketSubscribe`. All four `previewed*` variables were affected.

---

### ~~[#140](https://github.com/bitfocus/companion-module-resolume-arena/issues/140) — `paramId should not be undefined` / `state does not contain a composition`~~ ✅ Merged — [PR #168](https://github.com/bitfocus/companion-module-resolume-arena/pull/168)

Root cause: TypeScript `!` non-null assertions have no runtime effect. When `compositionState` isn't hydrated or an index is out of range, the ID lookup returns `undefined` → NaN → triggers the warning. Fix: replace `obj?.prop!.sub!.id!` with `obj?.prop?.sub?.id`, guard `setParam`/`subscribeParam` behind `id !== undefined`, and emit a named warn log in the else branch. 9 new tests, 410 passing.

---

### ~~[#143](https://github.com/bitfocus/companion-module-resolume-arena/issues/143) — Layer group / column preset actions not working~~ ✅ Open PR — [PR #169](https://github.com/bitfocus/companion-module-resolume-arena/pull/169)

Three bugs: (1) `clearLayerGroup` crashed with TypeError when layer group index was out of bounds — fixed with optional chaining. (2) `connectLayerGroupColumn`/`selectLayerGroupColumn` did not pass `options.value` through `parseVariablesInString` — variable references resolved as NaN. (3) `calculateNext/PreviousConnected/SelectedLayerGroupColumn` returned NaN instead of `undefined` when column maps uninitialized. 4 new tests, 404 passing.

---

### ~~[#134](https://github.com/bitfocus/companion-module-resolume-arena/issues/134) — Bypass Layer Toggle broken on Stream Deck+ rotary encoder~~ ✅ Open PR — [PR #172](https://github.com/bitfocus/companion-module-resolume-arena/pull/172)

Root cause: when a rotary encoder is the sole subscriber, Companion's subscribe/unsubscribe cycle briefly drops the WS path subscription during the action press, so the `parameter_update` never arrives and the feedback stays stale. Fix: optimistically update `parameterStates` and call `checkFeedbacks('layerBypassed')` immediately after `setPath`. 6 new unit tests, 406 passing.

---

### [#146](https://github.com/bitfocus/companion-module-resolume-arena/issues/146) — Performance: full state fetch on every action
**Branch:** `fix/146-selective-subscriptions`
**Size:** XL (3–5 days)
**Plan:** [`issues/146-selective-subscriptions.md`](issues/146-selective-subscriptions.md)

Root cause is **not** per-action full-state fetches. The real problem is blanket N×M subscriptions driven by composition shape rather than active feedbacks — every structural WS message triggers an unsubscribe+resubscribe for every clip×layer×column. There is also no ref-counting or teardown, so subscription count accumulates over hours until disable/enable resets it.

**Proposed fix:** a `SubscriptionRegistry` (`src/websocket-subscription-registry.ts`) with ref-counted acquire/release per path/param-id. `compositionState` is kept for topology lookups only; it no longer auto-subscribes anything. Feedbacks own their subscriptions via `subscribe`/`unsubscribe` hooks. On reconnect, the registry replays all held subscriptions.

**8 staged PRs:** (1) plumbing/registry no-op wrap → (2) dedupe inside registry → (3) reconnect replay → (4–6) convert clip/column/layer/group feedbacks to per-feedback subscribe → (7) delta actions use cached value instead of REST → (8) observability/diagnostics.

---

## Feature Enhancements (implement after bugs)

### ~~[#151](https://github.com/bitfocus/companion-module-resolume-arena/issues/151) — Clip Name Variable (fixed grid position)~~ ✅ Merged — [PR #162](https://github.com/bitfocus/companion-module-resolume-arena/pull/162)

Variable exposing clip name at a specific layer/column coordinate, updating live via WebSocket. Known gap: does not update when clips are drag-swapped in Resolume.

---

### ~~[#157](https://github.com/bitfocus/companion-module-resolume-arena/issues/157) — Layer Active Clip Transport Position as Variable~~ ✅ Merged — [PR #164](https://github.com/bitfocus/companion-module-resolume-arena/pull/164)

Added `ws_layer_N_*` variables (elapsed, elapsed_seconds, duration, remaining, remaining_seconds, progress) driven by real-time WebSocket position updates, plus `osc_layer_N_elapsed_seconds`. Also fixed OSC timing variables showing 0 on startup.

---

### ~~[#138](https://github.com/bitfocus/companion-module-resolume-arena/issues/138) — Forward / Backward / Play / Pause / Reverse actions~~ ✅ Merged — [PR #165](https://github.com/bitfocus/companion-module-resolume-arena/pull/165)

Added play, pause, forward, backward, reverse transport actions for composition, group, layer, and clip. Includes play/pause toggle preset.

---

### ~~[#141](https://github.com/bitfocus/companion-module-resolume-arena/issues/141) — Trigger thumbnail update on clip~~ ❌ Blocked — Resolume API limitation

REST GET returns a static cached image generated at media load time. REST POST only accepts a `file://` or `source://` URL to set a custom image. OSC has no effect. No API exists to force a live thumbnail re-render. Needs a Resolume feature request.

---

### ~~[#137](https://github.com/bitfocus/companion-module-resolume-arena/issues/137) — Connect column by name~~ ✅ Merged — [PR #173](https://github.com/bitfocus/companion-module-resolume-arena/pull/173)

Added "By index" / "By name" dropdown to the connect column action. Name lookup scans `parameterStates` for `/composition/columns/{n}/name` keys. Logs error and aborts gracefully if name not found. 3 new unit tests (found, not found, null restApi), 404 passing.

---

### ~~[#100](https://github.com/bitfocus/companion-module-resolume-arena/issues/100) — Fullscreen and advanced fullscreen toggle~~ ❌ Blocked — Resolume API limitation

Confirmed by maintainer comment: fullscreen output mode is not exposed in the Resolume REST or OSC API. Needs a Resolume feature request.

---

### [#159](https://github.com/bitfocus/companion-module-resolume-arena/issues/159) — Effect control & feedback (StageFlow, Chaser, Bumper, …)
**Branch:** `feat/159-effect-control-feedback`
**Size:** XL (3–5 days)
**Plan:** [`issues/159-effect-control-feedback.md`](issues/159-effect-control-feedback.md)

The API model is already in `src/domain/api.ts` (`VideoEffect` with `id`, `bypassed`, `params`, `valuetype` metadata). The WS transport already supports param-id-based get/set/subscribe. The only gap: `effects_update` WS messages are currently logged and dropped (`src/websocket.ts:94`), and no `/video/effects/` paths are written or subscribed today.

**Proposed fix:** fully dynamic discovery via `compositionState` (REST fallback via `ArenaLayersApi.getSettings`). Address effect instances by `VideoEffect.id` (stable across reorder), display as `displayName (#idx)` in dropdowns. Generic `effectParameterSet` / `effectBypass` / `effectTrigger` actions; `effectParameter` feedback. Value coercion driven by `valuetype` metadata at runtime.

**5 staged PRs:** (1) `EffectUtils` plumbing + `effects_update` hook, no UI → (2) `effectBypass` action + feedback, layer scope only → (3) generic `effectParameterSet` + `effectParameter` for all `valuetype`s → (4) scope expansion to clip/group/composition → (5) variables + presets + docs.

---

### [#98](https://github.com/bitfocus/companion-module-resolume-arena/issues/98) — Expressions for columns, layers, etc.
**Branch:** `feat/98-expressions`
**Size:** XL (multiple days)
**Plan:** [`issues/98-expressions.md`](issues/98-expressions.md)

`@companion-module/base` ~1.10 exposes only `parseVariablesInString` — no expression API. The module already calls it at 162 sites across 28 files. Today, `1 + $(x) * 10` substitutes to `"1 + 2 * 10"` then coerces to `NaN`. There is also a cosmetic red-variable bug: `regex: Regex.NUMBER` paired with `useVariables: true` rejects raw `$(...)` tokens.

**Proposed fix:** add `expr-eval` (~25 KB), implement `resolveExpression` / `resolveNumber` / `resolveInt` helpers on the module instance (pipeline: `parseVariablesInString` → evaluator → string-passthrough fallback). Remove `regex: Regex.NUMBER` from the four shared builders in `src/defaults.ts` (fixes the red-variable bug, included in PR 1). Only numeric fields are migrated initially; string fields (column name etc.) stay on `parseVariablesInString` until explicitly requested.

**6 staged PRs:** (1) evaluator infra + defaults.ts red-bug fix → (2) clip/column call-sites → (3) layer → (4) layer-group/deck/composition → (5) osc-transport → (6) docs/labels.

---

## Blocked — Requires Resolume API changes

These cannot be implemented until Resolume exposes the necessary API surface. No work to do on our side beyond monitoring Resolume release notes.

| # | Title |
|---|-------|
| [#55](https://github.com/bitfocus/companion-module-resolume-arena/issues/55) | Layer Timer / Transport position (API endpoint missing) |
| [#52](https://github.com/bitfocus/companion-module-resolume-arena/issues/52) | ClearAll / ClearComposition (no REST equivalent of OSC ClearAll) |
| [#51](https://github.com/bitfocus/companion-module-resolume-arena/issues/51) | Closed Decks not exposed in API |
| [#47](https://github.com/bitfocus/companion-module-resolume-arena/issues/47) | Active/Connected state for Layer + Layer Group |
| [#141](https://github.com/bitfocus/companion-module-resolume-arena/issues/141) | Thumbnail refresh (no live re-render endpoint) |
| [#100](https://github.com/bitfocus/companion-module-resolume-arena/issues/100) | Fullscreen / advanced fullscreen (not in Resolume API) |

---

## Quick wins

Issues that are S or S–M in size, have clear scope, and carry no architectural risk.

| # | Title | Size | Status | Notes |
|---|-------|------|--------|-------|
| [#149](https://github.com/bitfocus/companion-module-resolume-arena/issues/149) | WebSocket `OPEN` static vs instance | S | **merged PR #163** | |
| [#142](https://github.com/bitfocus/companion-module-resolume-arena/issues/142) | `previewedClipName` variable always empty | S | **merged PR #167** | |
| [#134](https://github.com/bitfocus/companion-module-resolume-arena/issues/134) | Bypass Layer Toggle broken on rotary encoder | S | **open PR #172** | optimistic state + checkFeedbacks |
| [#137](https://github.com/bitfocus/companion-module-resolume-arena/issues/137) | Connect column by name | M | **merged PR #173** | byIndex/byName dropdown |
| [#141](https://github.com/bitfocus/companion-module-resolume-arena/issues/141) | Trigger thumbnail refresh action | S | **blocked** | No Resolume API to force live re-render |
| [#100](https://github.com/bitfocus/companion-module-resolume-arena/issues/100) | Fullscreen / advanced fullscreen toggle | S | **blocked** | Not in Resolume API |
| [#157](https://github.com/bitfocus/companion-module-resolume-arena/issues/157) | Transport position as variable | S–M | **merged PR #164** | |
| [#151](https://github.com/bitfocus/companion-module-resolume-arena/issues/151) | Clip name variable by fixed grid position | M | **merged PR #162** | |
| [#138](https://github.com/bitfocus/companion-module-resolume-arena/issues/138) | Transport actions (play/pause/reverse/toggle) | M | **merged PR #165** | |

---

## Suggested order of work

1. ~~**#149**~~ — ✅ merged PR #163
2. ~~**#151**~~ — ✅ merged PR #162
3. ~~**#157**~~ — ✅ merged PR #164
4. ~~**#138**~~ — ✅ merged PR #165
5. ~~**#142**~~ — ✅ merged PR #167
6. ~~**#140**~~ — ✅ merged PR #168 && ~~**#143**~~ — ✅ PR #169 open
7. ~~**#134**~~ — ✅ open PR #172
8. ~~**#141**~~ — ❌ blocked (Resolume API limitation)
9. ~~**#100**~~ — ❌ blocked (Resolume API limitation)
10. ~~**#137**~~ — ✅ merged PR #173
11. **#146** — Selective subscriptions (large, do after smaller items ship)
12. **#159** — Effect control/feedback (large, plan separately)
13. **#98** — Expressions (largest, defer until Companion SDK support is clearer)
