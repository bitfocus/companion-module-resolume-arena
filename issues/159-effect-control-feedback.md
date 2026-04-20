# Issue #159 — Effect control and feedback for effects like StageFlow, Chaser, Bumper

**Link:** https://github.com/bitfocus/companion-module-resolume-arena/issues/159
**Author:** @timvangucht
**State:** OPEN, `enhancement`

## 1. User need (summarized)

The user wants to control per-effect parameters on a specific layer (or clip / group / composition) from Companion and receive live feedback — values, on/off, preset selection — mirroring what one sees in Resolume. The request explicitly calls out **StageFlow Looks**, **Chaser**, and **Bumper**, and asks that the solution be **generic** (so any effect works, not just a hand-picked list).

Key requirements:
- Bidirectional: actions drive Resolume, and feedbacks update when the mouse is used in Resolume.
- Generic: avoid hardcoding one action per known effect.
- Target scope: at minimum per-layer; ideally clip / layer / layer-group / composition.

## 2. What the Resolume REST / WS API actually exposes for effects

Based on `src/domain/api.ts` (generated from Resolume's OpenAPI) and `src/websocket.ts`:

### Data model
- `Composition.layers[i].video.effects: VideoEffect[]` — every layer exposes its chain of video effects.
- `VideoEffect` shape:
  - `id: number` — instance id of this effect on this layer.
  - `name: string` — unique key (e.g. `stageflow`, `chaser`, `bumper`).
  - `displayName: string` — user-facing label.
  - `bypassed: BooleanParameter` — on/off switch; has its own parameter `id`.
  - `mixer: ParameterCollection` — standard blend / opacity knobs.
  - `params: ParameterCollection` — the effect-specific parameters (this is where StageFlow Look, Chaser Speed, etc. live).
  - `effect: ParameterCollection` — extra collection the REST model exposes for some effect types.
- `AudioEffect` is analogous for `layer.audio.effects` (simpler: `bypassed` + `params`).
- Identical structures exist on `Clip.video.effects`, `LayerGroup.video.effects`, and (implied by the OpenAPI) composition-level effects.
- `ParameterCollection` is `{ [paramName]: StringParameter | BooleanParameter | IntegerParameter | ColorParameter | RangeParameter | ChoiceParameter | TextParameter }`. Each parameter carries its own numeric `id` plus `valuetype`, `value`, and (for range/choice) `min`/`max`/`options`, plus a `view` hint with `controlType`, `displayUnits`, `multiplier`, `step`, `suffix`.

### Transport options

The WS client (`src/websocket.ts`, 288 lines) already supports two addressing modes — **both are exactly what we need**:

1. **By path** — `/composition/layers/<n>/video/effects/<idx>/bypassed`, `.../params/<paramName>`, etc. Supported methods: `getPath`, `setPath`, `resetPath`, `triggerPath`, `subscribePath`, `unsubscribePath`.
2. **By parameter id** — uses `/parameter/by-id/<id>` internally. Supported methods: `getParam`, `setParam`, `resetParam`, `triggerParam`, `subscribeParam`, `unsubscribeParam`.

WS messages of type `parameter_update` / `parameter_subscribed` flow through `updateNeededSubscribers` and land in `parameterStates`, **regardless of whether the change came from Companion or from a mouse click in Resolume**. This is the mechanism that already powers live bypass / opacity / volume feedback and extends naturally to effect parameters.

There is also a `effects_update` WS message type — currently ignored (`src/websocket.ts:94`). Resolume emits this when an effect is added/removed/reordered on a track. We need to handle it to keep the dynamic UI in sync.

### REST endpoints relevant here
- `GET /composition/layers/<n>` — already used via `ArenaLayersApi.getSettings`; the response hydrates `layer.video.effects` with their full parameter tree, including `id`s. This is the authoritative source for **dynamic discovery**.
- `GET /composition` — full hydration if needed.
- Adding / removing effects is out of scope for this issue; the user only asks for control and feedback of existing effects.

### Verification
Grepped `effect`, `videoeffect`, `by-id` across `src/`: the `effects_update` message is seen but dropped, no `/video/effects/` paths are written or subscribed anywhere today. So this is genuinely net-new surface; no hidden half-built implementation to reconcile with.

## 3. Dynamic discovery vs hardcoded per-effect

**Recommendation: fully dynamic, with per-parameter inputs generated from the live effect tree.** Rationale:

- Resolume ships dozens of effects and users install more. A hardcoded `stageflowLookSelect` / `chaserSpeed` / `bumperAmount` action set would cover a fraction of usage and rot every Arena release.
- The REST response carries enough metadata (`valuetype`, `min`/`max`, `options`, `view.controlType`) to pick the correct Companion input type at runtime.
- The existing `layerMaster` / `layerOpacity` feedbacks already pull live metadata out of `compositionState` to look up parameter ids — same pattern scales to effects.

**Design sketch:**

- One generic action `effectParameterSet` with options:
  - `scope`: dropdown (layer / layer group / clip / composition) — drives the path prefix.
  - `layer` / `column` / `group` / scope-dependent numeric inputs (textinput + `useVariables`, matching `getLayerOption()` pattern).
  - `effect`: dropdown populated from live state (`displayName (idx: N)` as label, `idx` as value). Falls back to a numeric textinput when state is unavailable so presets still work before the first WS payload.
  - `parameter`: dropdown of parameter names within the selected effect. Same fallback.
  - `value`: polymorphic — rendered as `textinput` with `useVariables: true`; the action coerces to the right type based on the parameter's `valuetype` looked up at execution time. This avoids needing N different action variants for number vs bool vs choice.
- Two companion actions for ergonomics:
  - `effectBypass` — toggle / on / off (mirrors existing `bypassLayer` shape).
  - `effectTrigger` — for `ParamEvent` (rare but needed for Chaser "Re-Trigger" etc.).
- One generic feedback `effectParameter`:
  - Boolean feedback for `ParamBoolean` / `ParamState`.
  - Advanced feedback (text + optional image) for range / choice, showing current value with unit (`view.displayUnits`, `view.multiplier`, `view.suffix`).
- Identification strategy: prefer **parameter id** for both set and subscribe (more stable across reordering), resolve path-based only for the initial discovery.

### Addressing the "which effect instance" problem

Effects can be duplicated on a layer (two StageFlow chains). Index-based addressing is fragile across reorder. Two options:

- **A (simple):** index (1-based) within `layer.video.effects`. Stable during a session, breaks if user reorders. Easy to populate dropdown from live state.
- **B (robust):** `VideoEffect.id`. Stable for the lifetime of the instance. Requires us to expose ids in the dropdown and resolve them back to a path for path-based WS calls (or stay fully param-id-based, which Resolume supports).

Recommendation: **store id under the hood, display `displayName (#idx)` in the dropdown**. Best of both.

## 4. Files that will change

New:
- `src/domain/effects/effect-util.ts` — mirrors `layer-util.ts`: holds subscription maps (`Map<effectInstanceId, Set<feedbackId>>`), effect tree cache, and feedback callbacks. Implements `MessageSubscriber` so `effects_update` can retrigger discovery.
- `src/domain/effects/effect-discovery.ts` — helpers to walk `compositionState` (and optionally REST fallback) returning `{ scope, index, id, name, displayName, params: ParamMeta[] }`.
- `src/actions/effect/effectActions.ts` + `src/actions/effect/actions/effect-parameter-set.ts`, `.../effect-bypass.ts`, `.../effect-trigger.ts`.
- `src/feedbacks/effect/effectFeedbacks.ts` + `src/feedbacks/effect/feedbacks/effectParameter.ts`, `.../effectBypassed.ts`.
- `src/presets/effect/` — starter presets for common effects (can stay minimal: bypass + one parameter example).
- `src/variables/effect/` — optional: expose current value of subscribed effect params as Companion variables `resolume_layer_<n>_effect_<idx>_<param>`.
- Tests:
  - Unit: `src/domain/effects/__tests__/effect-discovery.test.ts`, parameter-type coercion tests.
  - Integration: new spec under existing integration suite that toggles an effect bypass on the test composition and asserts the WS parameter_update echoes back into `parameterStates`.

Modified:
- `src/actions.ts` — register `getEffectActions`.
- `src/api-feedback.ts` — register `getEffectFeedbacks`.
- `src/api-presets.ts` — register effect presets.
- `src/api-variables.ts` — optional variables registration.
- `src/index.ts` — instantiate `EffectUtils` similarly to `LayerUtils`, expose getter, wire into WS message subscribers.
- `src/websocket.ts` — line 94 currently logs/ignores `effects_update`. Route it to a new subscriber hook so `EffectUtils` can refresh its cache and re-emit feedback checks. Do **not** change the existing path/param transports; they already cover what we need.
- `src/defaults.ts` — add `getEffectOption()` option helpers for the reusable option set.

## 5. Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Effect reorder invalidates index-based dropdowns | High in a live show | Address by `VideoEffect.id` internally; repopulate on `effects_update`. |
| Action configured against an effect that no longer exists | Medium | Callback checks existence against current state; logs a warning; no throw. Same tolerance as current layer actions handle missing layers. |
| Polymorphic value input confuses users | Medium | Show parameter metadata (type, range, options) as an info suffix in the option label. Document in README. |
| `effects_update` payload format not documented | Medium | Inspect during integration test run; fall back to periodic REST re-poll (mirrors `osc-state.ts` periodic refresh) if WS payload is insufficient. |
| REST `getSettings` called per keypress | Low | Cache in `EffectUtils`; invalidate on `effects_update`. Never hit REST on the hot path once subscriptions are established — use `parameterStates` like existing feedbacks. |
| Breaking older configs | Low | This is additive; no existing action/feedback changes shape. No upgrade script needed for v1. |
| WS subscription leak on effect removal | Medium | On `effects_update`, compare old vs new ids and `unsubscribeParam` for anything that disappeared. |

## 6. Suggested incremental PR plan

Small PRs, each green on `yarn test` + `yarn test:integration`, each referencing #159.

1. **PR 1 — discovery & plumbing, no user-visible surface.**
   - Add `EffectUtils` skeleton, register as WS subscriber, parse `compositionState.layers[*].video.effects`, expose `listEffects(layerN)` / `getEffectParam(effectId, paramName)`.
   - Hook up `effects_update` → `EffectUtils.refresh()` in `websocket.ts`.
   - Unit tests for discovery against a fixture composition JSON.

2. **PR 2 — effect bypass action + feedback (layer scope only).**
   - Smallest end-to-end slice: `effectBypass` action and `effectBypassed` feedback, both using parameter-id subscriptions.
   - Integration test: flip bypass via action, assert feedback reflects it; flip via direct WS write simulating a mouse click, assert feedback still reflects it.

3. **PR 3 — generic `effectParameterSet` action + `effectParameter` feedback.**
   - Handle `ParamBoolean`, `ParamRange`, `ParamChoice`, `ParamState`, `ParamNumber`, `ParamString` (text), `ParamEvent` via a dedicated `effectTrigger` variant.
   - Value coercion helper + unit tests for each `valuetype`.
   - Advanced feedback rendering using `view.multiplier` / `suffix` / `displayUnits`.

4. **PR 4 — scope expansion.**
   - Extend action/feedback options to clip / layer-group / composition scopes. Minimal: reuse the same discovery walker, just start from a different root.
   - Integration tests for one non-layer scope (layer-group is highest value).

5. **PR 5 — variables + presets + docs.**
   - Expose per-subscribed-parameter variables so users can show effect state on neighbouring buttons.
   - Starter presets for StageFlow Look select + Chaser speed + generic bypass.
   - README section documenting the generic effect action, variable naming convention, and the reorder caveat.

Sub-PRs 1 and 2 are prerequisites for everything else; 3, 4, 5 can be parallelized if needed.

## 7. Test strategy

### Unit (`yarn test`)
- Discovery: given a synthetic `Composition` fixture, `listEffects(1)` returns the right instances with `id`, `displayName`, parameter metadata.
- Value coercion: `coerceParamValue('0.5', 'ParamRange', {min:0,max:1})` → `0.5`; `'on'` + `ParamBoolean` → `true`; `'toggle'` with current state true → `false`; option label → choice index for `ParamChoice`; out-of-range clamps.
- Subscription bookkeeping: subscribing twice adds two entries but only one `subscribeParam`; unsubscribe last entry calls `unsubscribeParam`.
- `effects_update` reconcile: adding an effect produces new subscriptions, removing triggers `unsubscribeParam`, reorder preserves id-based subscriptions.

### Integration (`yarn test:integration`, sequential)
- Requires the composition in `memory/project_test_setup.md` to have at least one layer with StageFlow (or any effect) — add this to the test composition if missing, and update the memory note.
- Per rules in project `CLAUDE.md`: disable the Companion module first so the OSC port is free.
- Scenarios:
  1. Module connects, REST + WS hydrate, `EffectUtils.listEffects(1)` returns non-empty.
  2. `effectBypass` action toggles the effect; `parameterStates` updates within N ms via WS; feedback returns `true`.
  3. Simulate external change by writing the same `bypassed` path via `websocket.setPath` directly from the test and assert the feedback flips (models the "mouse click in Resolume" case).
  4. `effects_update` synthetic: remove a subscribed effect from the composition and confirm `unsubscribeParam` was called.
  5. Parameter set for each `valuetype` supported in PR 3 against real effect parameters (StageFlow Look = ChoiceParameter; Chaser Speed = RangeParameter; Bumper Bypass = BooleanParameter).

### Manual smoke
- Load a real show, drop a StageFlow + Chaser + Bumper on layer 1, verify generic action + feedback behave on each. Reorder effects and confirm feedback stays on the right instance (validates id-based addressing).

## 8. Open questions / to confirm during PR 1

- Exact shape of the `effects_update` WS message. Current code logs and discards. We must either capture one during integration or ask upstream.
- Whether mixer parameters (`VideoEffect.mixer`) need to be exposed alongside `params`. Low priority; defer unless a user asks.
- Composition-level effects path: the OpenAPI `Composition` interface does not explicitly list `.effects`, but `Effects` is a separate top-level object on the REST tree. Confirm the path (`/composition/video/effects/...` or similar) before implementing scope = composition in PR 4.
- Whether to expose effect add/remove/reorder as actions. Issue #159 does **not** ask for this. Keep out of scope; open a follow-up issue if users request.
