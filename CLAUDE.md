# Claude Instructions — companion-module-resolume-arena

## Testing Requirements

Every change must include tests. No task is done until tests pass.

- **Unit tests**: cover all new logic. Run with `yarn test`.
- **Integration tests**: add wherever useful — not limited to OSC/WebSocket or variables. Run with `yarn test:integration`.
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

## Agent Rules (sub-agents spawned by the team)

### Verify API paths before implementing

Before using any WebSocket path (e.g. `/composition/outputmode`) or OSC path, grep for it in the existing source:

```
grep -r "the-path" src/arena-api/ src/osc-state.ts src/websocket.ts
```

If it does not appear, it is not a known API surface. Do not invent paths — check the Resolume REST API docs or ask. Implementing against a non-existent path wastes a branch and introduces dead code.

### Check feasibility before writing code

If the issue says "check if the API exposes X", do the check first. Read the relevant arena-api files, grep for the endpoint, and confirm it exists and is writable. If it does not exist, report back immediately — do not write a stub implementation or a test for something that cannot work.

### Never push

`git push` is blocked by project settings. Do not attempt it. Commit your branch and stop there.

### Commit checklist

Only commit when all of the following are true:
- `yarn test` passes (all unit tests green).
- The commit message references the issue number.
