# Test Plan — companion-module-resolume-arena

## Setup

- **Framework:** Vitest v2 (aligns with `companion-module-base` and the broader Bitfocus ecosystem)
- **Coverage:** `@vitest/coverage-v8` (V8-native, built into Vitest)
- **Branch:** `feat/test-setup`
- **Run tests:** `yarn test`
- **Watch mode:** `yarn test:watch`
- **Run with coverage:** `yarn test:coverage`
- **Config:** `vitest.config.ts`
- **Test files:** `test/**/*.test.ts`

---

## Phase 1 — Unit Tests (no network, no Resolume required)

These tests run in isolation. No mocks needed for pure functions; light mocks needed for classes that take a `ResolumeArenaModuleInstance`.

### 1.1 Pure value objects and math — ✅ done

| File | Test file | Status |
|------|-----------|--------|
| `src/domain/clip/clip-id.ts` | `test/unit/clip-id-test.ts` | ✅ done |
| `src/defaults.ts` — `getSpeedValue` | `test/unit/defaults-test.ts` | ✅ done |

Note: `getSpeedValue(100)` ≈ 4.0 — this is Resolume's internal OSC scale for "normal speed", not 1.0.

### 1.2 Option builder functions in `defaults.ts`

Functions like `getDeckOption`, `getLayerOption`, `getColumnOption`, `getClipOption`, `getLayerGroupOption` return static `CompanionInputFieldTextInput[]` structures. Tests should assert the `id`, `type`, `default`, and `useVariables` fields.

| File | Test file | Status |
|------|-----------|--------|
| `src/defaults.ts` — option builders | `test/unit/defaults-test.ts` | ☐ todo |

### 1.3 Variable definitions

Pure functions that return `CompanionVariableDefinition[]`. No deps, just verify the expected variable IDs are present.

| File | Test file | Status |
|------|-----------|--------|
| `src/variables/clip/clipVariables.ts` | `test/unit/clip-variables-test.ts` | ☐ todo |
| `src/variables/column/columnVariables.ts` | `test/unit/column-variables-test.ts` | ☐ todo |
| `src/variables/osc-variables.ts` | `test/unit/osc-variables-test.ts` | ☐ todo |

### 1.4 Domain utilities — with a mock `ResolumeArenaModuleInstance`

These classes hold subscription maps and react to WebSocket path updates. The module instance needs to be mocked (just `checkFeedbacks`, `setVariableValues`, `log`, `getWebsocketApi`).

**`LayerUtils`** (`src/domain/layers/layer-util.ts`)

| Scenario | What to assert |
|----------|---------------|
| `messageUpdates` with a `/composition/layers/1/select` path | `checkFeedbacks('layerSelected')` called |
| `messageUpdates` with a `/composition/layers/1/bypassed` path | `checkFeedbacks('layerBypassed')` called |
| `messageUpdates` with a `/composition/layers/1/solo` path | `checkFeedbacks('layerSolo')` called |
| `layerBypassedFeedbackSubscribe` called twice for same layer | WebSocket `subscribePath` called only once |
| `layerBypassedFeedbackUnsubscribe` removes last subscriber | `unsubscribePath` called |
| `layerActiveFeedbackCallback` with active layer in map | returns `true` |
| `layerActiveFeedbackCallback` with no entry in map | returns `false` |

**`ClipUtils`** (`src/domain/clip/clip-utils.ts`)

| Scenario | What to assert |
|----------|---------------|
| `messageUpdates` with `/composition/layers/1/clips/2/connect` | `checkFeedbacks('connectedClip')` called |
| `messageUpdates` with `/composition/layers/1/clips/2/select` + `value: true` | `setVariableValues` called with correct layer/column |
| `messageUpdates` with select path + `value: false` | `checkFeedbacks` called, `setVariableValues` NOT called |
| `clipSelectedFeedbackCallback` | asserts against `parameterStates` |

**`LayerTransportPositionFeedbackCallback`** time-code math in `LayerUtils`

The SMPTE-style time calculation is complex and pure enough to unit test given a mocked `parameterStates`. Worth extracting into a helper or testing indirectly via a mock that populates the state.

| Scenario | What to assert |
|----------|---------------|
| `view: 'fullSeconds'` with `value: 500, max: 1000` | output text matches expected |
| `view: 'timestamp'` | HH:MM:SS string format |
| `view: 'timestamp_noHours'` | MM:SS format |
| `timeRemaining: true` | inverts the time calculation |

### 1.5 OSC state helpers (`src/osc-state.ts`)

The file is ~28k lines. Focus on the methods used by the OSC transport actions:

| Method | Scenario | What to assert |
|--------|----------|---------------|
| `getActiveClipColumn(layer)` | layer is active | returns column number |
| `getActiveClipColumn(layer)` | layer is inactive | returns `undefined` |
| `getLayerDurationSeconds(layer)` | data present | returns number |
| `getLayerElapsedSeconds(layer)` | data present | returns number |
| `scheduleQuickRefresh()` | called | fires a query after delay |

### 1.6 OSC action callback logic

The OSC transport actions in `oscTransportActions.ts` use `parseIntParam`/`parseFloatParam` helpers (closures, not exported). The callbacks themselves are testable by injecting mock `oscApi` and `oscState` via the module factory.

| Action | Scenario | What to assert |
|--------|----------|---------------|
| `oscTriggerColumn` | valid column | `oscApi.triggerColumn(col)` called |
| `oscTriggerColumn` | non-numeric input | nothing called |
| `oscClipPauseResume` toggle | current direction is 1 (paused) | sends value 2 (play) |
| `oscClipPauseResume` toggle | current direction is 2 (playing) | sends value 1 (pause) |
| `oscClipGoToTime` | valid time, duration known | `api.send` with correct normalized value |
| `oscClipGoToTime` | duration is 0 | `log('warn', ...)` called, no send |
| `oscClipJogTime` | jog past end | clamped to 1.0 normalized |
| `oscClipJogTime` | jog before start | clamped to 0.0 normalized |
| `oscClipGoToSecondsFromEnd` | target < 0 | clamped to 0.0 |
| `oscCustomCommand` | type `n` | no value argument sent |

---

## Phase 2 — Integration Tests (Resolume Arena must be running on local PC)

**Prerequisites:**
- Resolume Arena running on `localhost` (or configured host)
- REST API enabled (default port `8080`)
- OSC enabled (default port `7000` in, `7001` out)
- A known composition loaded with at least 3 layers and 5 columns
- A specific clip at layer 1 / column 1 that we can trigger and verify

**Config:** put connection details in `test/integration/config.ts` (gitignored). Example:

```typescript
export const TEST_HOST = process.env.RESOLUME_HOST ?? 'localhost';
export const REST_PORT = +(process.env.RESOLUME_REST_PORT ?? 8080);
export const OSC_OUT_PORT = +(process.env.RESOLUME_OSC_OUT ?? 7000);
export const OSC_IN_PORT = +(process.env.RESOLUME_OSC_IN ?? 7001);
```

Run with: `yarn test:integration` (separate script using same QUnit runner but filtered to `test/integration/**/*-test.ts`).

### 2.1 REST API — read operations

| Scenario | Verify |
|----------|--------|
| `GET /composition` | returns a composition object with `layers` array |
| `GET /composition/layers/1` | returns layer object with `id`, `clips`, `audio`, `video` |
| `GET /composition/layers/1/clips/1` | returns clip with `transport`, `video`, `audio` fields |
| `GET /product/version` | returns version string |

### 2.2 REST API — write operations

| Scenario | Action | Verify via REST |
|----------|--------|-----------------|
| Connect clip | `POST /composition/layers/1/clips/1/connect` | GET clip status shows `Connected` |
| Clear layer | `DELETE /composition/layers/1/clips` or equivalent | GET shows no connected clip |
| Set layer opacity | `PUT .../video/opacity` with `{value: 0.5}` | GET shows `opacity.value ≈ 0.5` |
| Set layer volume | `PUT .../audio/volume` | GET shows `volume.value` updated |

### 2.3 OSC — trigger and verify via REST

| Scenario | OSC message | Verify |
|----------|-------------|--------|
| Trigger column 1 | `/composition/columns/1/connect` | REST confirms a clip is connected on expected layers |
| Clear all layers | `/composition/disconnectall` | REST confirms no clips connected |
| Set clip speed | `/composition/layers/1/clips/1/transport/position/behaviour/speed` | REST reads speed back |
| Bypass layer | `/composition/layers/1/bypassed 1` | REST reads `bypassed = true` |
| Unbypass layer | `/composition/layers/1/bypassed 0` | REST reads `bypassed = false` |
| Bypass toggle via `!` | `/composition/layers/1/bypassed !` | state flips relative to before |
| Tempo tap | `/composition/tempocontroller/tap` | no error, BPM changes |

### 2.4 OSC state — verify listener picks up changes

This tests the full loop: action via REST → OSC listener receives update → `oscState` reflects new value.

| Scenario | Trigger | Verify |
|----------|---------|--------|
| Connect clip → OSC state | REST connect clip 1/1 | `oscState.getActiveClipColumn(1) === 1` within 500ms |
| Clear layer → OSC state | REST clear layer 1 | `oscState.getActiveClipColumn(1) === undefined` |
| Duration arrives after connect | connect clip with known duration | `oscState.getLayerDurationSeconds(1) > 0` within 1s |

### 2.5 Feedback verification via REST

These tests simulate what Companion does: trigger an action, then check the feedback callback returns the expected value.

| Feedback | Setup | Expected |
|----------|-------|----------|
| `connectedClip` layer 1, column 1 | REST connect clip 1/1 | feedback returns `true` |
| `connectedClip` layer 1, column 1 | REST clear layer 1 | feedback returns `false` |
| `layerBypassed` layer 1 | REST bypass layer 1 | feedback returns `true` |
| `layerOpacity` layer 1 | REST set opacity 0.5 | feedback text is `50%` |

### 2.6 Variable verification

| Variable | Trigger | Expected value |
|----------|---------|----------------|
| `selectedClip` | WebSocket select event for layer 2 / column 3 | `{"layer":"2","column":"3"}` |
| `selectedClipLayer` | same | `"2"` |
| `selectedClipColumn` | same | `"3"` |

---

## Coverage targets

| Phase | Target |
|-------|--------|
| After Phase 1 complete | ≥ 40% line coverage on `src/` |
| After Phase 2 complete | ≥ 60% line coverage on `src/` |

Current baseline: **0.37%** (2 pure-function modules covered, 13 tests passing).

---

## What NOT to test

- `osc-state.ts` as a whole-file black box — it's 28k lines of generated/state-sync code; test only the public query methods.
- `image-utils.ts` pixel rendering — too fragile to assert pixel values; test only that it returns a `Uint8Array` of non-zero length.
- `upgrade-scripts/` — migration scripts; rely on the existing companion tools test harness for these.
- Companion `presets/` — static config data with no logic; not worth the maintenance cost.
