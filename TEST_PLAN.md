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
| `src/defaults.ts` — option builders | `test/unit/defaults.test.ts` | ✅ done |

### 1.3 Variable definitions

Pure functions that return `CompanionVariableDefinition[]`. No deps, just verify the expected variable IDs are present.

| File | Test file | Status |
|------|-----------|--------|
| `src/variables/clip/clipVariables.ts` | `test/unit/clip-variables.test.ts` | ✅ done |
| `src/variables/column/columnVariables.ts` | `test/unit/column-variables.test.ts` | ✅ done |
| `src/variables/osc-variables.ts` | `test/unit/osc-variables.test.ts` | ✅ done |

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

### 1.6 Domain utilities — additional

| File | Test file | Status |
|------|-----------|--------|
| `src/domain/layer-groups/layer-group-util.ts` | `test/unit/layer-group-util.test.ts` | ✅ done |
| `src/domain/columns/column-util.ts` | `test/unit/column-util.test.ts` | ✅ done |
| `src/domain/deck/deck-util.ts` | `test/unit/deck-util.test.ts` | ✅ done |
| `src/domain/composition/composition-utils.ts` | `test/unit/composition-util.test.ts` | ✅ done |

### 1.7 Action callback logic — additional

| File | Test file | Status |
|------|-----------|--------|
| `src/actions/composition/actions/composition-*.ts` | `test/unit/composition-actions.test.ts` | ✅ done |
| `src/actions/layer/actions/*.ts` | `test/unit/layer-actions.test.ts` | ✅ done |
| `src/actions/layer-group/actions/*.ts` | `test/unit/layer-group-actions.test.ts` | ✅ done |
| `src/actions/layer-group/actions/connect/select-layer-group-column.ts` | `test/unit/layer-group-column-actions.test.ts` | ✅ done |
| `src/actions/clip/actions/clip-speed-change.ts`, `clip-volume-change.ts` | `test/unit/layer-group-column-actions.test.ts` | ✅ done |
| `src/actions/clip/actions/connect-clip.ts`, `select-clip.ts` | `test/unit/clip-column-actions.test.ts` | ✅ done |
| `src/actions/column/actions/connectColumn.ts`, `selectColumn.ts` | `test/unit/clip-column-actions.test.ts` | ✅ done |
| `src/actions/deck/actions/*.ts` | `test/unit/clip-column-actions.test.ts` | ✅ done |
| `src/actions/composition/actions/comp-next-col.ts`, `clear-all-layers.ts`, etc. | `test/unit/misc-actions.test.ts` | ✅ done |

### 1.9 OSC action callback logic

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

**Status: ✅ done** — tests across 17 test files

**Prerequisites:**
- Resolume Arena running on `127.0.0.1` (use explicit IP, not `localhost` — Node may resolve it as IPv6)
- REST API enabled (default port `8080`)
- OSC Input enabled on port `7000`
- OSC Output enabled on port `7001` (tests use active `?` queries; passive output optional)
- Composition: 3 layers, 3 columns with media in layer 1/col 1 (minimum)
- Layer group 1 containing layers 2 and 3, same clips

**Config:** `test/integration/config.ts` (gitignored — copy from `config.example.ts`).

Run with: `yarn test:integration` (uses `vitest.integration.config.ts`, serial, skipped in CI)

**Test files:**
- `test/integration/rest-api.test.ts` — REST read/write (8 tests)
- `test/integration/osc.test.ts` — OSC trigger + REST verify (6 tests)
- `test/integration/osc-state-loop.test.ts` — OscState active-query loop (8 tests)
- `test/integration/layer-group.test.ts` — Layer group REST + OSC (6 tests)
- `test/integration/composition.test.ts` — Composition structure, column/clip API, layer solo, column nav (18 tests)
- `test/integration/layer-parameters.test.ts` — Layer master/opacity/transition duration read/write, clip parameters (20 tests)
- `test/integration/deck-column.test.ts` — Deck structure/navigation, column read/write, column trigger (18 tests)
- `test/integration/layer-group-extended.test.ts` — Layer group full structure, master/solo/bypass/speed write, column navigation (20 tests)
- `test/integration/osc-variables.test.ts` — OscState variables: active column, clip name, duration, elapsed/remaining/progress (19 tests)
- `test/integration/composition-parameters.test.ts` — Composition opacity/master/speed read/write, tempoResync (9 tests)
- `test/integration/clip-parameters.test.ts` — Clip opacity/volume/speed write via REST, clip opacity via OSC (5 tests)

**Implementation notes:**
- All tests use `describe.skipIf(!resolume)` so they skip cleanly when Resolume is not running
- Tests requiring loaded clips additionally gate on `testClipHasMedia()` (`describe.skipIf(!hasMedia)`)
- Integration tests are excluded from `yarn test` (unit only) and from GitHub Actions CI
- Tests run serially (`singleFork: true`, `sequence.concurrent: false`) — one Resolume instance, shared state
- "Clear" tests use a passive/inject hybrid: tries passive OSC first, falls back to REST-verify + inject if Resolume's `?` query returns `connected=1` (in-deck) instead of `0`

### 2.1 REST API — read operations — ✅ done

| Scenario | Verify | Status |
|----------|--------|--------|
| `GET /product` | name + version fields | ✅ |
| `GET /composition/layers/1` | returns layer with `clips[]` | ✅ |
| `GET /composition/layers/1/clips/1` | returns clip with `connected` field | ✅ |
| Layer `audio.volume` structure | value is a number | ✅ |

### 2.2 REST API — write operations — ✅ done

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| POST connect endpoint | `POST /layers/1/clips/1/connect` | no error | ✅ |
| Connect clip + clear | POST connect → clear | no Connected clips after clear | ✅ (requires media) |
| Set layer opacity | `PUT /layers/1` with `video.opacity.value=0.5` | GET shows `≈ 0.5` | ✅ |
| Layer group opacity | `PUT /layergroups/1` with `video.opacity.value=0.5` | GET confirms | ✅ |
| Audio volume via REST | — | not testable via REST write; module uses WebSocket internally | ℹ️ |

### 2.3 OSC — trigger and verify via REST — ✅ done

| Scenario | OSC message | Verify | Status |
|----------|-------------|--------|--------|
| Clear all layers | `clearAllLayers()` | no Connected clips | ✅ |
| Trigger column | `triggerColumn(1)` | ≥1 Connected clip | ✅ (requires media) |
| Bypass layer | `bypassLayer(1, 1)` | REST `bypassed = true` | ✅ |
| Unbypass layer | `bypassLayer(1, 0)` | REST `bypassed = false` | ✅ |
| Clip speed + connect | `connectClip` + `send speed` | `transport.controls.speed` defined | ✅ (requires media) |
| Tempo tap | `tempoTap()` | no error | ✅ |
| Bypass layer group | `bypassLayerGroup(1, 1)` | REST group `bypassed = true` | ✅ |
| Trigger layer group column | `triggerlayerGroupColumn(1, 1)` | group layer has Connected clip | ✅ (requires media) |
| Clear layer group | `clearLayerGroup(1)` | group layers have no Connected clips | ✅ (requires media) |

### 2.4 OSC state — active query loop — ✅ done

Uses `?` queries to Resolume; no passive OSC output configuration required.

| Scenario | Trigger | Verify | Status |
|----------|---------|--------|--------|
| Connect clip → OscState | REST connect | `getActiveClipColumn(1) === 1` | ✅ (requires media) |
| Clear layer → OscState | REST clear | `getActiveClipColumn(1) === undefined` | ✅ (requires media) |
| Duration arrives after connect | REST connect | `getLayerDurationSeconds(1) > 0` | ✅ (requires media) |

### 2.5 Feedback — OscState active column — ✅ done

| Scenario | Trigger | Verify | Status |
|----------|---------|--------|--------|
| Connect clip | REST connect | active column set | ✅ (requires media) |
| Clear layer | REST clear | active column undefined | ✅ (requires media) |

### 2.6 Direct OscState message injection — ✅ done

| Scenario | Trigger | Verify | Status |
|----------|---------|--------|--------|
| `/connected >= 2` | `handleMessage(path, 2)` | `getActiveClipColumn` returns column | ✅ |
| `/connected 0` | `handleMessage(path, 0)` | `getActiveClipColumn` returns undefined | ✅ |
| `/select` path | `handleMessage(path, true)` | no error | ✅ |

### 2.7 Composition-level parameters — REST read/write — ✅ done

File: `test/integration/composition-parameters.test.ts`

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| Composition has `video.opacity` field | `GET /composition` | `video.opacity.value` is a number | ✅ |
| Composition has `master` field | `GET /composition` | `master.value` is a number | ✅ |
| Composition has `speed` field | `GET /composition` | `speed.value` is a number | ✅ |
| Composition has `audio.volume` field | `GET /composition` | `audio.volume.value` is a number | ✅ |
| Set composition opacity to 0.5 | `PUT /composition` with `video.opacity.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| Set composition master to 0.75 | `PUT /composition` with `master.value=0.75` | GET confirms `≈ 0.75` | ✅ |
| Set composition speed to 0.5 | `PUT /composition` with `speed.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| `tempoResync` via OSC | `oscApi.tempoResync()` | no error, Resolume still responds | ✅ |

### 2.8 Layer parameters — OSC write path — ✅ done

Added to: `test/integration/layer-parameters.test.ts`

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| Layer solo via OSC | send `/layers/N/solo` with value 1 | REST `solo.value === true` | ✅ |
| Layer select via OSC | send `/layers/N/select` with value 1 | REST `selected.value === true` or `"Selected"` | ✅ |
| Layer volume write via REST | `PUT /layers/N` with `audio.volume.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| Layer transition duration write via REST | `PUT /layers/N` with `transition.duration.value` | GET confirms new value | ✅ |

### 2.9 Clip parameter write — requires media — ✅ done

File: `test/integration/clip-parameters.test.ts`

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| Set clip opacity via REST | connect clip → `PUT /clips/N` with `video.opacity.value=0.25` | GET confirms `≈ 0.25` | ✅ |
| Set clip volume via REST | connect clip → `PUT /clips/N` with `audio.volume.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| Set clip speed via REST | connect clip → `PUT /clips/N` with `transport.controls.speed.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| Clip opacity change via OSC | connect clip → send `/clips/N/video/opacity` with 0.75 | REST confirms `≈ 0.75` | ✅ |

### 2.10 Column select via OSC — ✅ done

Added to: `test/integration/deck-column.test.ts`

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| `selectColumn(N)` via OSC | send `/composition/columns/N/select` with value 1 | REST `selected.value === true` or Resolume alive | ✅ |
| `selectColumn` on column 2 | select col 2 | REST col 2 responds, restore col 1 | ✅ |

### 2.11 OscState transport variables — requires media — ✅ done

Added to: `test/integration/osc-variables.test.ts`

| Variable | Trigger | Verify | Status |
|----------|---------|--------|--------|
| `osc_layer_N_elapsed` | connect clip → query position path | value matches timecode pattern | ✅ |
| `osc_layer_N_remaining` | position + duration known | value matches timecode pattern | ✅ |
| `osc_layer_N_progress` | position + duration known | value is a non-empty string | ✅ |

### 2.12 Layer group volume and select — ✅ done

Added to: `test/integration/layer-group-extended.test.ts`

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| Layer group volume write via REST | `PUT /layergroups/N` with `audio.volume.value=0.5` | GET confirms `≈ 0.5` | ✅ |
| Layer group select via REST | `api.LayerGroups.select(N)` | GET `selected.value === true` or alive | ✅ |
| Select layer group column via OSC | send `/groups/N/columns/M/select` with 1 | REST group responds | ✅ |

### 2.13 Feedback data contracts — ✅ done

File: `test/integration/feedback-data-contract.test.ts`

Feedback callbacks are bound to the live Companion module instance and cannot be called in isolation. This file tests whether Resolume's REST API returns the field shapes and value types that each feedback callback reads. If these contracts break, feedbacks silently return defaults — the kind of regression only this level of test catches.

| Feedback | Data source | What is verified | Status |
|----------|-------------|-----------------|--------|
| `clipInfo` | `clip.name.value` | Type is string when media loaded; absent/empty for empty clip | ✅ |
| `clipTransportPosition` | `clip.transport.position` | Structure present when clip is playing | ✅ |
| `clipSpeed` | `clip.transport.controls.speed.value` | Non-negative number when clip is playing | ✅ |
| `clipOpacity` | `clip.video.opacity.value` | Number in [0, 1] | ✅ |
| `clipVolume` | `clip.audio.volume.value` | Number when audio present | ✅ |
| `connectedClip` | `clip.connected.value` | Valid string enum; becomes `Connected` after connect | ✅ |
| `selectedClip` | `clip.selected.value` | Boolean or `"Selected"` after OSC `selectClip` | ✅ |
| `tempo` | `composition.tempoController.tempo.value` | Number in (20, 300) BPM | ✅ |
| `deckSelected` | `deck.selected.value` | Boolean; exactly one deck selected at a time | ✅ |
| `layerGroupSelected` | `group.selected.value` | Truthy after `LayerGroups.select()` | ✅ |
| `layerGroupActive` | group layer clips | Connected clip exists after trigger; none after clear | ✅ |
| `columnConnected` | `column.connected.value` | Valid string enum; transitions correctly on trigger/clear | ✅ |
| `columnSelected` | `column.selected.value` | Boolean or `"Selected"` after OSC column select | ✅ |

### 2.14 Column variables data pipeline — ✅ done

File: `test/integration/column-variables.test.ts`

The Companion variables `selectedColumn` and `connectedColumn` are driven by websocket messages in `ColumnUtils.messageUpdates()`. The Companion runtime is not available in integration tests, so variable values cannot be asserted directly. Instead, these tests assert the Resolume REST state that the websocket carries — if these pass, the variable update logic has valid input.

| Variable | Trigger | REST state verified | Status |
|----------|---------|---------------------|--------|
| `connectedColumn` | `triggerColumn(N)` | `column.connected.value === 'Connected'` | ✅ (requires media) |
| `connectedColumn` | `clearAllLayers()` | `column.connected.value !== 'Connected'` | ✅ |
| `connectedColumn` | trigger column 2 | column 2 is Connected, TEST_COLUMN is not | ✅ (requires media) |
| `selectedColumn` | OSC `/columns/N/select` with 1 | `column.selected.value === true` or `"Selected"` | ✅ |
| `selectedColumn` | select column 2 | column 2 selected; column ids are distinct | ✅ |
| (name feedbacks) | REST name update | Name round-trips; can be restored | ✅ |

### 2.15 Deck select by index — ✅ done

Added to: `test/integration/deck-column.test.ts`

The `selectDeck` action sends `/composition/decks/{n}/select` via the websocket `triggerPath`. This is tested via raw OSC to confirm that deck-by-index selection works and the REST API reflects the change.

| Scenario | Action | Verify | Status |
|----------|--------|--------|--------|
| Select deck 1 by index | OSC `/composition/decks/1/select` with 1 | `deck.selected.value === true` | ✅ |
| Switch to deck 2 by index | OSC `/composition/decks/2/select` with 1 | deck 2 `selected.value === true`; restore deck 1 | ✅ |
| Exactly one deck selected | OSC select deck 1 | Only 1 deck in composition has `selected.value === true` | ✅ |

---

## Integration test coverage summary

| File | Suites | Key area |
|------|--------|----------|
| `rest-api.test.ts` | 7 | REST API fundamentals |
| `composition.test.ts` | 9 | Composition structure, layer solo, navigation |
| `composition-parameters.test.ts` | 5 | Composition parameter read/write |
| `clip-parameters.test.ts` | 4 | Clip parameter write (opacity, volume, speed) |
| `clip-thumbnail.test.ts` | 2 | Clip thumbnail fetch |
| `deck-column.test.ts` | 10 | Deck structure/navigation, column state, deck-by-index select |
| `layer-parameters.test.ts` | 12 | Layer parameters, multi-layer/column, OSC solo/select |
| `layer-group.test.ts` | 5 | Layer group basic operations |
| `layer-group-columns.test.ts` | 2 | Layer group column API |
| `layer-group-extended.test.ts` | 10 | Layer group full parameter coverage |
| `osc.test.ts` | 5 | Core OSC operations |
| `osc-navigation.test.ts` | 4 | Column/clip navigation via OSC |
| `osc-custom.test.ts` | 4 | Custom OSC action |
| `osc-state-loop.test.ts` | 3 | OscState active clip tracking |
| `osc-variables.test.ts` | 4 | OSC-driven Companion variables |
| `feedback-data-contract.test.ts` | 10 | REST data contracts for all feedback types |
| `column-variables.test.ts` | 3 | Data pipeline for column variables |

---

## Coverage targets

| Phase | Target |
|-------|--------|
| After Phase 1 complete | ≥ 40% line coverage on `src/` |
| After Phase 2 complete | ≥ 60% line coverage on `src/` |

Phase 1 baseline: **14.31%** line coverage (74 unit tests across 10 files).

Phase 1 extended: **32.47%** line coverage (240 unit tests across 20 files).

Phase 2 complete (original): **46 integration tests** across 5 files. Phase 2 extended: **~116 integration tests** across 9 files (296 total unit + integration). Integration tests are excluded from coverage measurement (they require a live Resolume instance).

---

## What NOT to test

- `osc-state.ts` as a whole-file black box — it's 28k lines of generated/state-sync code; test only the public query methods.
- `image-utils.ts` pixel rendering — too fragile to assert pixel values; test only that it returns a `Uint8Array` of non-zero length.
- `upgrade-scripts/` — migration scripts; rely on the existing companion tools test harness for these.
- Companion `presets/` — static config data with no logic; not worth the maintenance cost.
