# Issue #98 — Expression support in action/feedback input fields

Upstream: https://github.com/bitfocus/companion-module-resolume-arena/issues/98
Related Companion core issue: https://github.com/bitfocus/companion/issues/2345
Referenced predecessor PR: #91 (introduced `useVariables: true` + `parseVariablesInString` calls)

## 1. Problem statement

Reporter (pepsijon) wants text inputs in this module to support **Companion expressions**,
not just variable substitution. Concretely he wants things like:

```
1 + $(internal:custom_A_Layer) * 10
concat($(this:page), '/', $(this:row), '/', $(this:column))
```

Today, entering an expression like `1 + $(internal:custom_A_Layer) * 10` into e.g. the
"Layer" field of *Trigger Clip* yields the literal string `1 + 2 * 10` after variable
substitution, which then gets coerced with `+string` into `NaN`. So only raw variable
references work; any arithmetic/string manipulation fails.

Secondary cosmetic bug reported in the same issue: variable references render **red**
in this module's fields even though they evaluate correctly. This is a side-effect of
pairing `useVariables: true` with `regex: Regex.NUMBER` — the raw `$(...)` token does
not match the number regex, so the UI flags it invalid. Worth fixing alongside.

## 2. State of the Companion module SDK (`@companion-module/base` ~1.10.0)

Verified against `node_modules/@companion-module/base/dist/module-api/`:

- `CompanionInputFieldTextInput` supports `useVariables?: boolean | { local?: boolean }`
  (`input.d.ts:154`). This is **variable substitution only**, not expression evaluation.
- The SDK exposes `context.parseVariablesInString(text)` and
  `InstanceBase.parseVariablesInString(text)` (`common.d.ts:11`, `base.d.ts:118`).
  These replace `$(connection:name)` tokens with their current string value.
- The only mention of "expression" in the SDK surface is on button style text
  (`style.d.ts:9` — a presentation flag for button text), not for action/feedback options.
- **There is no `parseExpression` / `executeExpression` API exposed to modules.**
  Companion core issue #2345 (linked by the reporter) is still the tracking ticket for
  adding this to the module SDK. Until that lands, modules that want expression support
  must evaluate them in-module.

Implication: the work for this issue is **module-side**. We need our own expression
evaluator (or a dependency) that accepts strings post-variable-substitution and returns
a number or string.

## 3. Current state of the codebase

Verified by grepping `src/`:

- 28 files define `type: 'textinput'` fields; essentially every numeric/string option
  lives in one. All of them already set `useVariables: true` (see `src/defaults.ts`
  shared option builders and each action/feedback file).
- 162 call sites use `parseVariablesInString(...)`. Dominant pattern:

  ```ts
  const layer = +await context.parseVariablesInString(feedback.options.layer as string);
  const column = +await context.parseVariablesInString(feedback.options.column as string);
  ```

  …found in: `src/domain/clip/clip-utils.ts`, `src/domain/layers/layer-util.ts`,
  `src/domain/layer-groups/layer-group-util.ts`, `src/domain/columns/column-util.ts`,
  `src/domain/deck/deck-util.ts`, every action under
  `src/actions/{clip,column,composition,deck,layer,layer-group,osc-transport}/`, and
  feedbacks under `src/feedbacks/osc-transport/`.
- Shared option builders live in `src/defaults.ts`:
  `getDeckOption`, `getColumnOption`, `getLayerOption`, `getClipOption`,
  `getLayerGroupOption`. These are the single biggest leverage points — changing them
  propagates to every action/feedback that uses them.
- `src/actions/osc-transport/oscTransportActions.ts` defines its own `parseIntParam` /
  `parseFloatParam` helpers wrapping `parseVariablesInString`. These are the natural
  templates for a `resolveExpression` helper.
- `src/actions/column/actions/connectColumn.ts` already uses `parseVariablesInString`
  on a *string* field (column name) — shows the same helper must support string output,
  not just numeric.

## 4. Gap analysis

| Input | Today | Gap |
|---|---|---|
| `$(conn:var)` | works (substituted by `parseVariablesInString`) | none |
| `1 + 2` | fails (returns literal string → `NaN` via `+str`) | needs arithmetic evaluation |
| `$(internal:x) + 1` | fails (substitutes to `2 + 1`, then `+"2 + 1"` = `NaN`) | needs arithmetic after substitution |
| `concat($(this:page), '/', …)` | fails (function not evaluated) | needs function/string support |
| `round(…)`, ternaries, comparisons | fails | needs full expression parser |
| `regex: Regex.NUMBER` on variable/expression fields | shows red | regex invalid once field is expression-capable |

## 5. Approach

### 5.1 Evaluator choice (recommendation)

Two realistic options:

1. **Add a lightweight dependency** — e.g. `expr-eval` or `mathjs`.
   - `expr-eval` (~25 KB) supports arithmetic, comparisons, ternary, basic string ops
     via custom functions. Easy drop-in.
   - `mathjs` is heavier but has `concat`, `round`, etc. out of the box.
   - **Caveat**: Companion's own expression grammar is a superset of maths
     (ternary, string functions, template-literal style). Using a third-party engine
     means our dialect will diverge from Companion's documented expression syntax —
     users will hit edge cases. Document clearly what is supported.

2. **Port Companion's expression engine.** The parser lives at
   `companion/lib/Shared/Expression/*` (and in `companion-module-utils` packages).
   Not currently re-exported from `@companion-module/base`. We could vendor a minimal
   copy or pull from a sibling published package. This keeps dialect parity but adds
   maintenance cost and license review.

**Recommended**: option 1 with `expr-eval` + a small set of custom functions
(`concat`, `round`, `floor`, `ceil`, `abs`, `min`, `max`, `length`) that mirror the
most-used Companion expression functions. Revisit and swap to the SDK's future native
API once Companion core #2345 ships.

### 5.2 Resolution pipeline

A single helper on `ResolumeArenaModuleInstance` (or a standalone util):

```ts
async resolveExpression(input: string): Promise<string>
async resolveNumber(input: string): Promise<number | undefined>
async resolveInt(input: string): Promise<number | undefined>
```

Pipeline for `resolveExpression`:

1. Variable substitution: `await parseVariablesInString(input)` — existing SDK call.
2. Try expression evaluation on the substituted string.
3. If evaluation throws (unparsable — treat as plain string), return the substituted
   string verbatim. This is the crucial backward-compatibility rule: a column name like
   `My Column` must still pass through untouched.
4. If evaluation succeeds, stringify the result.

`resolveNumber` wraps `resolveExpression` and coerces with `Number(...)`, returning
`undefined` for `NaN` so callers can early-exit (matches `parseIntParam` pattern in
`oscTransportActions.ts`).

This pipeline is a pure superset of today's behavior — any input that worked before
keeps working.

### 5.3 Field configuration

- Remove `regex: Regex.NUMBER` from the 4 shared builders in `defaults.ts`
  (`deck`, `column`, `layer`, `layerGroup`). This fixes the "red" bug pepsijon
  reported. The evaluator already validates at runtime; the UI regex hint is wrong
  once expressions are allowed. Same cleanup for standalone textinputs in
  `src/actions/layer/actions/layer-next-col.ts` (`regex: Regex.NUMBER` with a variable
  field is likewise misleading) — audit all `regex: Regex.NUMBER` usages paired with
  `useVariables: true`.
- Keep `useVariables: true` (the UI will continue to show the variable picker; the
  expression syntax is typed alongside).
- Consider updating field `label`s to hint at expression support, e.g.
  `"Layer (variable or expression)"` — purely cosmetic, low-risk.

### 5.4 Call-site migration

Every site matching

```ts
+await ...parseVariablesInString(options.<X> as string)
```

becomes

```ts
await ...resolveInt(options.<X> as string)  // returns number | undefined
```

String fields (e.g. column `name` in `connectColumn.ts`) use `resolveExpression` to
still benefit from expression string functions while preserving plain-string input.

## 6. Files to change

### Core infrastructure (PR 1)
- `src/index.ts` — add `resolveExpression`, `resolveNumber`, `resolveInt` on
  `ResolumeArenaModuleInstance`.
- new `src/util/expression.ts` — evaluator wrapper + function table + unit tests.
- `package.json` — add chosen dependency (`expr-eval` or equivalent).
- `src/defaults.ts` — drop `regex: Regex.NUMBER` from the four shared builders.
  Optionally update labels.
- Unit tests under `test/` covering: variable-only, arithmetic, mixed, string
  passthrough, malformed input, division by zero, type coercion.

### Action migrations (PRs 2–5, one per domain)

Group by domain for reviewable-sized PRs:

- **PR 2 — clip + column**
  - `src/actions/clip/actions/*.ts` (connect-clip, select-clip, clip-opacity-change,
    clip-volume-change, clip-speed-change)
  - `src/actions/column/actions/{connectColumn,selectColumn}.ts`
  - `src/domain/clip/clip-utils.ts` (~30 `parseVariablesInString` sites)
  - `src/domain/columns/column-util.ts`
- **PR 3 — layer**
  - `src/actions/layer/actions/*.ts` (10 files)
  - `src/domain/layers/layer-util.ts`
- **PR 4 — layer-group + deck + composition**
  - `src/actions/layer-group/actions/*.ts` (~12 files)
  - `src/actions/composition/actions/*.ts` (4 files)
  - `src/actions/deck/actions/select-deck.ts`
  - `src/domain/layer-groups/layer-group-util.ts`
  - `src/domain/deck/deck-util.ts`
- **PR 5 — osc-transport**
  - `src/actions/osc-transport/oscTransportActions.ts` — replace `parseIntParam`/
    `parseFloatParam` internals with the new helpers (keep names for minimal diff).
  - `src/feedbacks/osc-transport/oscTransportFeedbacks.ts`

Each PR is mechanical: identical pattern swap. Can be partially automated with a
codemod (`ts-morph`) but manual review is fine given the line count (~200 sites).

## 7. Risk assessment

| Risk | Mitigation |
|---|---|
| Breaking existing user configs where a literal string happens to look like an expression (e.g. column named `1-2`). | Evaluator only replaces string on *successful* parse. Since `1-2` parses to `-1`, a column literally named `1-2` would break. Mitigate: for *name-typed* fields call `resolveExpression` with a flag `preferString` that only evaluates if the input contains operators AND all variable expansions are numeric. Alternatively: only evaluate fields that were already coerced with `+` today (the numeric fields). Safer default = only touch numeric fields in PRs 2–5; leave string fields on `parseVariablesInString` until a separate discussion. |
| Dialect divergence from Companion's expression docs. | Document supported subset in README. Add a roadmap note to migrate to SDK-native API when #2345 ships. |
| Bundle-size regression in Companion. | `expr-eval` ≈ 25 KB minified. Acceptable; `mathjs` would not be. |
| Evaluator exceptions leak to callback and break actions silently. | Helpers catch and log via `this.log('warn', …)`, fall back to `undefined` for numeric and the substituted string for text. |
| Red-UI fix (`regex` removal) loses useful validation for users typing `abc` into Layer. | Acceptable — validation now happens at callback time with a warning log. Can be re-added as a looser regex if needed. |
| The cosmetic red-variable bug has a separate root cause. | Confirmed: it's the `Regex.NUMBER` + variable-token combo. Fix is already in PR 1. |

## 8. Test strategy

Per CLAUDE.md: every change requires tests, both suites must pass before completion.

**Unit tests (`yarn test`)** — new `test/util/expression.test.ts`:

- `resolveExpression('5')` → `'5'`
- `resolveExpression('1+2')` → `'3'`
- `resolveExpression('$(x)+1')` with `x=4` → `'5'`
- `resolveExpression('My Column')` → `'My Column'` (string passthrough)
- `resolveExpression('concat("a","/","b")')` → `'a/b'`
- `resolveInt('1+2*3')` → `7`
- `resolveInt('not a number')` → `undefined`
- Division-by-zero, negative numbers, floats.
- Variable-substitution only (backwards compat): `resolveExpression('$(x)')` with
  `x='foo'` → `'foo'`.

Mock `parseVariablesInString` via a small fake on `ResolumeArenaModuleInstance` to
decouple from SDK IPC.

**Integration tests (`yarn test:integration`)** — extend
`test/integration/actions.spec.ts` (or add a new file):

- Trigger Clip with `layer = 1+0` → same effect as `layer = 1`.
- Clip-opacity-change with `value = 100/2` → opacity 50%.
- Connect Column with `name = "Verse"` → still works (string passthrough).
- Variable substitution sanity — `$(internal:…)` style token substituted by the
  harness's variable fake (mirror existing integration helpers).

Run sequentially per `vitest.integration.config.ts` (non-negotiable, per project
CLAUDE.md).

## 9. Incremental plan summary

1. **PR 1 — infra**: evaluator + helpers + defaults.ts red-bug fix + unit tests. No
   call-site changes yet (keeps PR small & reviewable, zero behavioral risk).
2. **PR 2 — clip/column migration** + integration tests for those actions.
3. **PR 3 — layer migration** + integration tests.
4. **PR 4 — layer-group / deck / composition migration** + integration tests.
5. **PR 5 — osc-transport migration** + integration tests.
6. **PR 6 — docs/labels**: README section on supported expression syntax, optional
   label tweaks.

Each PR stands alone and leaves the module shippable. Close issue #98 on PR 5 merge.

## 10. Open questions

- Dependency choice: confirm `expr-eval` vs. a vendored Companion parser with
  maintainers before PR 1.
- Is there appetite for bumping `@companion-module/base` past 1.10.x in case a newer
  version has started exposing expression APIs? Worth checking current `~1.11`/`~1.12`
  release notes before committing to the in-module evaluator path.
- Should string fields (column name in `connectColumn`) also get expression support,
  or only numeric fields? Recommendation: numeric first (safer), revisit string fields
  if users request it.
