# Issue #146 — Selective Subscriptions / Performance on Big Compositions

Upstream: https://github.com/bitfocus/companion-module-resolume-arena/issues/146
Label/size: XL architectural refactor.

## 1. Problem Summary

Users with large compositions (many layers × columns) report network saturation, lag
and occasional freezes during live shows. The reporter asserts "every time a button
is pressed the module fetches the entire data state". A community fork
(`felipefalkiner/companion-module-resolume-arena`) claims to resolve the slowdown by
reducing traffic, though the reporter himself noted the slowdown eventually returns
and a module disable/enable clears it — suggesting an additional leak/accumulation
on top of raw traffic volume.

## 2. Root Cause Analysis

### 2.1 How state currently flows

Three transports coexist:

- **REST (`ArenaRestApi`)** — used for bootstrap (`productInfo`) and synchronous
  "fallback" reads inside actions and feedback subscribes when the parameter id is
  not yet known (see `src/domain/clip/clip-utils.ts:285, 358, 435, 586`;
  `src/domain/layers/layer-util.ts:275, 327, 392, 454`; `src/actions/**/*-change.ts`).
- **WebSocket (`WebsocketInstance`, `/api/v1`)** — the primary push channel. On
  connect, Resolume immediately pushes one enormous JSON document (the full
  composition — `message.columns && message.layers`, handled at
  `src/websocket.ts:81–90`) into `compositionState`. Subsequent diffs arrive as
  `parameter_update`/`parameter_subscribed` messages per subscribed path/id.
- **OSC (`ArenaOscApi` + `ArenaOscListener`)** — independent transport for
  transport/position info (feature-flagged via `useOscListener`).

### 2.2 Where the heavy traffic actually originates

Contrary to the reporter's wording, actions do **not** re-fetch the full state on
each button press. A grep for `restApi` in action files shows only per-value reads
(`Clips.getStatus`, `Layers.getSettings`) used by "change by delta" actions to
read the current value before writing. Per button these are small.

The real cost is:

1. **Full composition dump on every WS (re)connect.** `compositionState.set(message)`
   at `src/websocket.ts:86` replaces the entire composition whenever Arena sends
   the document. Arena sends it on connect and whenever the structural shape of
   the composition changes (layer/column add/remove, deck switch, etc.). In a
   large comp this is multiple MB of JSON.
2. **`messageUpdates` fan-out with `isComposition=true` triggers a cascade.** Every
   subscriber's `initComposition()` / `initConnectedFromComposition()` runs again:
   - `ClipUtils.initComposition` (line 92) re-subscribes connected/name/select/
     transport-position for *every clip in every layer*.
   - `ColumnUtils.initConnectedFromComposition` (line 62) re-subscribes select/
     connect/name for *every column*.
   - `LayerGroupUtils`, `LayerUtils`, `DeckUtils` do equivalent re-subscriptions.

   Each `subscribePath` call is a WS frame; structural updates therefore produce
   an N×M burst of subscribe frames (plus the matching unsubscribes the code
   issues first). Combined with the server echoing a `parameter_subscribed`
   per subscription, this is the traffic spike users observe.
3. **No subscription diffing.** The code unconditionally unsubscribes and
   resubscribes every clip/column/layer on every re-init, even when nothing
   changed. There is no awareness of which feedbacks/variables the user's page
   actually references.
4. **No unsubscription when feedbacks are destroyed.** Subscription counters
   (`clipDetailsSubscriptions` Maps in `ClipUtils`) track per-feedback IDs, but
   the bulk subscriptions in `initComposition` are not reference-counted — they
   stay live for the entire module lifetime. Over hours of use the server keeps
   pushing updates for parameters nobody looks at.
5. **Per-feedback eager subscription pattern.** Most feedbacks (e.g. clip opacity,
   clip volume, clip speed, layer master/opacity/volume, layer group master,
   composition master/speed) call `subscribeParam` / `subscribePath` in their
   `subscribe` callback, which is fine — Companion invokes this once per
   feedback instance. But the bulk "name" and "connect" subscriptions are done
   for the **entire composition** regardless of which clips are referenced by
   any button.

### 2.3 Why "disable/enable" clears it

Disabling the instance destroys the `WebsocketInstance` which implicitly drops
all server-side subscriptions. Re-enabling rebuilds only those that the current
feedbacks/variables actually need. This is strong evidence that the long-run
issue is subscription accumulation, not per-action traffic.

### 2.4 Summary of root cause

> Subscriptions are driven by **composition shape**, not by **what Companion is
> actually showing**. Every structural message from Arena triggers an O(layers ×
> columns) subscribe burst, and nothing is ever meaningfully torn down. On big
> compositions this saturates the loopback/LAN link and accumulates subscription
> count on the Arena server.

## 3. Proposed Architecture: Selective Subscriptions

### 3.1 Core idea

Decouple subscription lifecycle from composition structure. Model it as a
**reference-counted registry** keyed by WS parameter path/id, where the only
callers are:

- Feedback `subscribe` / `unsubscribe` hooks.
- Variable setup (when a given variable is actively defined).
- Explicit "module-level" infrastructure (e.g. `/composition/decks/current` so
  deck switch still works).

`compositionState` should still be populated (we need the topology to resolve
"layer 3 column 5" → a `paramId`), but its update **must not** auto-subscribe
anything. Instead, on every composition refresh:

1. Diff the new topology vs old.
2. For paths already in the registry, re-validate that the same `paramId` is
   still bound; if the id changed, migrate the subscription.
3. Drop subscriptions whose path no longer exists.
4. Do not pre-subscribe anything new proactively.

### 3.2 New module: `SubscriptionRegistry`

Proposed location: `src/websocket-subscription-registry.ts`.

```ts
type Key = string; // ws path, e.g. '/composition/layers/3/clips/5/name'
                   // or 'param:<id>' for by-id subscriptions

class SubscriptionRegistry {
  private counts = new Map<Key, number>();
  constructor(private ws: WebsocketInstance) {}

  acquirePath(path: string): void;       // +1, subscribe if 0→1
  releasePath(path: string): void;       // -1, unsubscribe if 1→0
  acquireParam(id: number): void;
  releaseParam(id: number): void;

  snapshot(): Key[];                     // for diagnostics / tests
  clear(): void;                         // on WS reconnect: re-assert all
  replay(): void;                        // re-issue all subscribes after reconnect
}
```

All current `subscribePath`/`subscribeParam`/`unsubscribePath`/`unsubscribeParam`
calls in `src/domain/**` move behind this registry. Direct calls on
`WebsocketInstance` become an internal detail the registry owns.

### 3.3 Rewrite `*Utils.messageUpdates` for the `isComposition` branch

- Stop calling `initComposition` / `initConnectedFromComposition` on every
  composition message.
- Replace with a `onCompositionTopologyChanged` callback that **only** refreshes
  cached id lookups (e.g. `clip.transport.position.id`) and rebinds existing
  registry entries whose id changed. No blanket subscribes.
- The first composition message still triggers one-time setup of module-level
  subscriptions (deck change, currently-selected column, etc.).

### 3.4 Feedback/variable subscribe hooks do the real work

Most feedbacks already wire a `subscribe` callback. Extend the ones that
currently rely on blanket subscriptions (clip name, clip connected, clip select,
column name/connect/select, deck name/selected, layer select, layer bypass,
layer group bypass/solo/selected, etc.) to explicitly acquire their paths via
the registry on subscribe and release on unsubscribe.

Variables registered via `setVariableDefinitions` do not have lifecycle hooks,
so variables that need live data (e.g. `clip_name_l3_c5`) must be "pulled"
instead — subscribe lazily in response to feedback demand, or bulk-subscribe
only for variables the user's preset actually exposes (harder; out of scope
for the first pass).

### 3.5 Reduce action-time REST reads

The delta actions (`clip-speed-change`, `clip-volume-change`, `clip-opacity-change`,
`layer-*-change`) currently hit REST to read the current value. If the feedback
for that parameter is already subscribed, the value is present in
`parameterStates`/`compositionState`; read from there first and only fall back
to REST if missing. This alone eliminates a REST round-trip per button press
for any button that also renders feedback for the same parameter.

### 3.6 Keep full `compositionState` for topology only

`compositionState` is useful for enumerating clips/columns by index → by-id
lookup and for supporting "connect column by name" (recent PR #137). Keep
populating it; just stop treating it as the subscription driver.

## 4. Files That Need to Change

Primary surface:

- `src/websocket.ts` — split `subscribe*` into low-level send primitives that
  the registry calls; drop direct public use.
- `src/websocket-subscription-registry.ts` — new file.
- `src/index.ts` — instantiate the registry, pass it to utils.
- `src/state.ts` — unchanged conceptually; consider adding a separate
  `paramIdIndex` for fast id lookup from topology diff.
- `src/domain/clip/clip-utils.ts` — biggest delta; remove
  `initConnectedFromComposition`, `initSelectedFromComposition`,
  `initClipNameVariables` blanket subscribes; move each to
  feedback-triggered acquire.
- `src/domain/columns/column-util.ts` — remove blanket column subscribes.
- `src/domain/composition/composition-utils.ts` — keep (already per-feedback).
- `src/domain/deck/deck-util.ts` — convert to per-feedback.
- `src/domain/layers/layer-util.ts` — convert to per-feedback.
- `src/domain/layer-groups/layer-group-util.ts` — convert to per-feedback.

Feedbacks (expand `subscribe`/`unsubscribe` hooks):

- `src/feedbacks/clip/**` (connectedClip, selectedClip, clipInfo, clipOpacity,
  clipVolume, clipSpeed, clipTransportPosition).
- `src/feedbacks/column/**` (columnName, columnConnected, columnSelected,
  connectedColumnName, selectedColumnName, next/previous variants).
- `src/feedbacks/deck/**`, `src/feedbacks/layer/**`, `src/feedbacks/layer-group/**`.

Actions (prefer cached value over REST):

- `src/actions/clip/actions/clip-speed-change.ts`
- `src/actions/clip/actions/clip-volume-change.ts`
- `src/actions/clip/actions/clip-opacity-change.ts`
- `src/actions/layer/actions/layer-master-change.ts`
- `src/actions/layer/actions/layer-opacity-change.ts`
- `src/actions/layer/actions/layer-volume-change.ts`
- `src/actions/layer/actions/layer-transition-duration-change.ts`

## 5. Risk Assessment

Rating: **XL / high risk**.

| Risk | Impact | Mitigation |
|---|---|---|
| Silent regression — feedbacks stop updating because their subscribe hook is missing | High: live-show failure | Add integration test that simulates feedback subscribe, then asserts a WS subscribe frame is sent |
| Race on reconnect — registry re-issues subs before WS OPEN | Medium: lost subs | `registry.replay()` must `await ws.waitForWebsocketReady()` (method already exists) |
| Param id churn across composition reloads | Medium: stale ids, feedback shows stale value | Resolve ids lazily at acquire time, re-resolve on topology diff |
| Users with current broken feedbacks that "accidentally worked" via blanket subs | Medium: will break on upgrade | Release behind a minor version bump with upgrade note; no config migration required |
| Variable population (clip_name_lX_cY) no longer fires without blanket sub | Medium: variables go empty | Keep a cheaper bulk subscribe for *names only* (small payload), OR drive by feedback demand |
| Ref-count leaks if subscribe is called without matching unsubscribe | Medium: same accumulation problem | Log a warning if a key reaches > N refs; add diagnostics preset |

## 6. Suggested Incremental Steps / Sub-PRs

Do not attempt this as one PR. Proposed slice plan:

**PR 1 — Introduce `SubscriptionRegistry` without behavioural change.**
Wrap existing `subscribe*`/`unsubscribe*` call-sites so every call goes through
the registry. Registry exposes ref-counts but behaves identically (no dedupe
yet — emit the same frames). Adds snapshot/logging for diagnostics. No
feedback changes. Goal: land the plumbing, ship it, observe.

**PR 2 — Dedupe inside the registry.**
Flip registry to "emit subscribe only on 0→1, unsubscribe on 1→0". This
already fixes the repeated-subscribe storm on reconnect. Feedbacks still
call via `initComposition` paths, but duplicates are swallowed. Low user-visible
risk.

**PR 3 — Replay on reconnect.**
Persist registry across `WebsocketInstance` rebuilds. On reconnect, replay
all held subs. Remove the `initComposition` blanket-subscribe on every
composition dump; trust replay.

**PR 4 — Convert clip feedbacks to per-feedback subscribe.**
Move clip connect/name/select subs out of `ClipUtils.initComposition` into the
feedback subscribe/unsubscribe hooks. Keep clip transport position as-is (it's
already per-feedback via param id).

**PR 5 — Convert column/deck/layer/layer-group feedbacks similarly.**
One PR per domain to keep review scope sane.

**PR 6 — Use cached values in delta actions.**
Prefer `parameterStates.get()[path]` over `restApi.*.getStatus`.

**PR 7 — Variables: lazy subscription or opt-in bulk for names.**
Address `clip_name_lX_cY` variable population. Simplest: add a config flag
"Subscribe all clip names" default off; users who need all-name variables
enable it explicitly.

**PR 8 — Observability.**
Add an internal debug action or log command that dumps registry state
(count of subscriptions, per-key ref count). Helps users self-diagnose if
slowdown returns.

## 7. Test Strategy

Per `CLAUDE.md`, every change needs tests and both suites must stay green.

### Unit (`yarn test`)

- `SubscriptionRegistry`: acquire/release ref-count math, 0→1 and 1→0 emission,
  replay/clear semantics, by-id vs by-path keyspaces do not collide.
- Feedback subscribe/unsubscribe: mock registry, assert `acquire*`/`release*`
  are called with the correct paths for every feedback type.
- Action delta: assert cached-value path is taken when `parameterStates`
  has the key, REST fallback only when missing.

### Integration (`yarn test:integration`, sequential)

Requires the live Arena test composition (see `memory/project_test_setup.md`).
Module must be disabled in Companion before running.

- **Subscription accounting**: on fresh connect, count WS subscribe frames.
  Before refactor this number is proportional to layers×columns. After: it
  should be proportional to *registered feedbacks only*. Baseline the current
  count, assert future number is strictly lower.
- **Reconnect replay**: force a WS disconnect, assert all previously-held
  subscriptions are re-issued exactly once after reconnect.
- **No accumulation**: add a feedback, remove it, repeat 100 times, assert
  WS subscribe count returns to baseline after each cycle (regression test
  for the "slowdown after some days" report).
- **Feedback still updates**: for each migrated feedback, trigger the
  corresponding Arena state change, assert `checkFeedbacks` fires and
  variable values update. Use existing feedback integration test harness
  (see current integration tests for `connectColumn` in PR #137 as template).
- **Cached action read**: subscribe the feedback for clip opacity, fire
  `clip-opacity-change` delta action, assert *no* REST call was made.

## 8. Out of Scope / Non-goals

- Changing the OSC transport (listener, state). That is an independent system
  and has its own periodic refresh tuning.
- Thumbnail fetching (`Clips.getThumb`) — unrelated; already REST-on-demand.
- Multi-instance sharing of subscriptions (one physical WS shared across
  Companion instances). Would require deeper coordination; user can open a
  follow-up if really needed.
- Addressing the upstream fork's code directly. Its approach (summarised in
  their `docs/`) may be worth reviewing for inspiration in PR 4/5, but the
  PRs above stand on their own.

## 9. Open Questions

1. Does Arena's WS server itself have a hard limit on subscription count?
   If so, the registry's dedupe benefit is a hard requirement not a nice-to-have.
2. Can we subscribe to a coarser-grained path (e.g. subscribe once to
   `/composition/layers/3/clips` and receive updates for the whole clip
   subtree)? If supported, collapse many per-property subs into one. Needs
   verification against the REST API docs per `CLAUDE.md` ("verify API paths
   before implementing").
3. Is there a server-side "get all parameter ids" endpoint that avoids the
   full composition document? If yes, PR 3 can ditch the full-document
   handler entirely and pull only id metadata.
