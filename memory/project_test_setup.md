---
name: project_test_setup
description: Integration test Resolume composition setup and OSC disconnect quirk
type: project
---

# Integration test composition requirements

Integration tests require a live Resolume Arena instance with a specific composition loaded.
Run tests with `yarn test:integration` — these **must** run sequentially (vitest.integration.config.ts enforces this).

**Before running integration tests**: disable the Resolume Arena module in Companion. The OSC listener tests bind to the same port that the running module occupies — if Companion holds the port, the tests will fail. Re-enable the module after tests complete.

## Layer / clip layout

| Location | Requirement |
|----------|-------------|
| Layer 1 | At least 1 effect (e.g. **Transform**) with at least one numeric (`ParamRange`) parameter (e.g. "Position X") |
| Clip 1/1 | At least 1 effect with a **bypassed** parameter (AddSubtract works) |
| Columns | At least 1 column |

## Effect parameter tests (`effect-control.test.ts`)

- Layer 1, effect 1 must have a numeric param. The tests find it dynamically via `compositionState`.
- The increase/decrease accumulation tests reset the param to its original value, apply 2× delta, and verify the cumulative change. Delta is ±0.05 — ensure the param's range allows at least ±0.1 headroom from its resting value.
- Tests restore the original value in `afterAll`; a failed run may leave the param offset.

## OSC disconnect quirk

After running integration tests, Resolume may show the OSC connection as broken in its UI. This is expected — the test suite binds the OSC listen port, which conflicts with the running module. Re-enable the module in Companion to reconnect.

## Column naming (connect-column-by-name tests)

- Column 1 must be named exactly **"Test Column"** (or set `RESOLUME_TEST_COLUMN_NAME` env var).
- At least one column name must contain the Resolume `#` placeholder (e.g. "Column #") so the resolution test can verify it expands to the 1-based index.
