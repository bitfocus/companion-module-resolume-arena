# Claude Instructions — companion-module-resolume-arena

## Testing Requirements

Every change must include tests. No task is done until tests pass.

- **Unit tests**: cover all new logic. Run with `yarn test`.
- **Integration tests**: required for any feature that touches the live Resolume WS/REST API — actions that send commands, feedbacks that subscribe and read state, variables. The only acceptable reason to skip an integration test is if the feature requires test-composition changes that are not yet documented (in that case, document what the composition needs in `memory/project_test_setup.md` and note it explicitly). Do not skip integration tests silently. Run with `yarn test:integration`.
- Integration tests **must run sequentially** — the config in `vitest.integration.config.ts` enforces this; never override it.
- Run both suites (unit and integration) before marking any task complete. If either fails, fix it first.

## Integration Test Setup

Integration tests require a live Resolume Arena instance with the test composition loaded. See `memory/project_test_setup.md` for the exact composition and OSC disconnect quirk to be aware of.

**Before running integration tests**: disable the Resolume Arena module in Companion. The OSC listener tests bind to the same port that the running module occupies — if Companion holds the port, the tests will fail. Re-enable the module after the tests complete.

**Always run integration tests after any change to integration test files.**

## Code Style

- All code, comments, and docs in English.
- Follow existing patterns in the codebase — check adjacent files before introducing new abstractions.
- Variable and action definitions follow the established domain structure under `src/domain/` and `src/variables/`.

## API Path Discipline

Before using any WebSocket or OSC path, verify it exists in the codebase:

```
grep -r "the-path" src/arena-api/ src/osc-state.ts src/websocket.ts
```

If it does not appear, it is not a known API surface. Check the Resolume REST API docs before implementing against it.
