# Spec: Phase 2 — Advanced Types

> Written using the [spec-driven-development](../../.github/skills/spec-driven-development/SKILL.md) skill.
> Corrected to match [plan.md](../../plan.md): Phase 2 = Advanced Types, not scaffoldComponent.

---

## Objective

Extend `scaffoldFunction` to produce correct, idiomatic output for all TypeScript advanced type forms in **both** `ts` and `js` output modes. Phase 1 handles primitive types (`string`, `number`, `boolean`) perfectly. Phase 2 ensures the full TypeScript type system is supported without breaking a single existing test.

**Target type forms from `plan.md`:**

| Form | Example |
|---|---|
| Union | `string \| number` |
| Generic | `Array<T>`, `Promise<T>`, `Map<string, number>` |
| Mapped | `Partial<User>`, `Record<string, number>` |
| Conditional | `T extends string ? 'yes' : 'no'` |
| Tuple | `[string, number, boolean]` |
| Function | `(x: string) => boolean`, `() => void` |

**What does success look like?**

- A developer calls `scaffoldFunction` with any of the above types as a `paramDef.tsType` or `outputType` and gets back a syntactically correct file pair.
- TypeScript output (`language: 'ts'`): types appear verbatim in the function signature — this already works. No regressions.
- JavaScript output (`language: 'js'`): JSDoc tags use proper JSDoc type syntax, not raw TypeScript syntax.
- Function-returning functions: `scaffoldFunction` with `outputType: '(name: string) => string'` generates a usable scaffold with a sensible placeholder return and a passing wiring test.

---

## Tech Stack

| Concern | Tool / Version |
|---|---|
| Language | TypeScript 5 |
| Runtime | Node.js ≥ 20 |
| Module format | ESM only (`"type": "module"`) |
| Tests | Node's built-in `node:test` + `node:assert/strict` |
| Test runner | `tsx/esm` loader — `node --import tsx/esm --test src/*.test.ts` |
| Build | `tsc` (output to `dist/`) |

---

## Commands

```
Build:     npm run build
Test:      node --import tsx/esm --test src/*.test.ts
Typecheck: npx tsc --noEmit
```

---

## Root Cause Analysis

Before specifying changes, here is exactly where the Phase 1 implementation falls short for advanced types:

### Gap 1 — `toJSDOC` renders TypeScript syntax verbatim in JS mode

`jsdoc.ts` line 32: `` `@param {${p.tsType}} ${p.name}` ``

TypeScript type strings are not valid JSDoc type expressions:

| TypeScript `tsType` | Current JS-mode JSDoc output | Correct JSDoc output |
|---|---|---|
| `string \| number` | `{string \| number}` | `{(string\|number)}` |
| `Array<string>` | `{Array<string>}` | `{Array.<string>}` |
| `Map<string, number>` | `{Map<string, number>}` | `{Map.<string, number>}` |
| `(x: string) => boolean` | `{(x: string) => boolean}` | `{function(string): boolean}` |
| `() => void` | `{() => void}` | `{function(): void}` |
| `[string, number]` | `{[string, number]}` | `{Array}` (JSDoc has no tuple syntax) |
| `T extends string ? A : B` | `{T extends string ? A : B}` | `{*}` (no JSDoc equivalent) |
| `string[]` | `{string[]}` | `{string[]}` ✓ (already correct) |
| `string` | `{string}` | `{string}` ✓ (already correct) |

### Gap 2 — `toSourceLiteral` cannot represent function values

`utils.ts` throws `TypeError` for `typeof value === 'function'` and non-JSON types.

A function-returning scaffold has no way to express a sensible placeholder return value (e.g., `() => false`) or a meaningful wiring test assertion.

**Consequence**: Calling `scaffoldFunction({ outputType: '() => boolean', exampleOutput: ???, … })` either throws from `toSourceLiteral` (if you pass a function) or generates `return null;` with a meaningless `assert.deepEqual(fn(), null)` wiring test.

### Gap 3 — Test template hardcodes `assert.deepEqual`

`test-template.ts` line 31: `` `assert.deepEqual(${funcName}(${callArgs}), ${expectedOutput})` ``

This is fine for primitive and object returns, but wrong for function returns — `deepEqual` on two function values always fails unless they are the same reference.

---

## Project Structure

Only **one new file** and **four modifications** to existing files. No new modules beyond `type-utils.ts`. All existing tests must continue to pass.

```
src/
  type-utils.ts           ← NEW: tsTypeToJSDoc() converter
  type-utils.test.ts      ← NEW: tests for the converter

  jsdoc.ts                ← MODIFIED: use tsTypeToJSDoc() in JS mode
  jsdoc.test.ts           ← MODIFIED: add advanced-type test cases

  types.ts                ← MODIFIED: add returnPlaceholder? to ScaffoldFunctionConfig
  scaffold.ts             ← MODIFIED: use returnPlaceholder when provided
  scaffold.test.ts        ← MODIFIED: add returnPlaceholder + advanced-type test cases

  test-template.ts        ← MODIFIED: accept returnPlaceholder, change assertion for it
  test-template.test.ts   ← MODIFIED: add returnPlaceholder test cases

  (all other files unchanged)
```

---

## Code Style

Follow Phase 1 conventions exactly:

- `.js` extensions on all ESM import specifiers within `.ts` files.
- No new runtime dependencies.
- JSDoc on every exported function: `@param`, `@returns`, `@throws`, `@example`.
- Test files colocated with source as `*.test.ts`.
- Errors thrown with a descriptive prefix: `tsTypeToJSDoc: …`.

---

## API Design

### 1. New: `src/type-utils.ts` — `tsTypeToJSDoc(tsType: string): string`

Converts a TypeScript type string to its JSDoc type expression equivalent for use inside `{…}` in `@param` and `@returns` tags.

```ts
/**
 * Converts a TypeScript type string to a JSDoc type expression.
 *
 * Used by toJSDOC() when generating JavaScript output so that
 * @param and @returns tags use valid JSDoc syntax rather than raw
 * TypeScript syntax.
 *
 * @param tsType - A TypeScript type string (e.g. 'string | number')
 * @returns The equivalent JSDoc type expression (e.g. '(string|number)')
 *
 * @example
 * tsTypeToJSDoc('string | number')   // → '(string|number)'
 * tsTypeToJSDoc('Array<string>')     // → 'Array.<string>'
 * tsTypeToJSDoc('() => void')        // → 'function(): void'
 * tsTypeToJSDoc('string')            // → 'string'
 */
export function tsTypeToJSDoc(tsType: string): string { … }
```

#### Conversion rules (in priority order)

The function applies a small set of well-ordered transformations. It does **not** attempt to parse a full TypeScript AST — it handles the practically relevant patterns.

| Pattern | Detection | Output |
|---|---|---|
| **Primitives and keywords** | `string`, `number`, `boolean`, `void`, `null`, `undefined`, `never`, `object`, `symbol`, `bigint` | Pass through unchanged |
| **`any` / `unknown`** | Exact match `'any'` or `'unknown'` | `'*'` |
| **Array shorthand** | Ends with `[]` (e.g. `string[]`, `User[]`) | Pass through unchanged (`{string[]}` is valid JSDoc) |
| **Tuple** | Starts with `[` (e.g. `[string, number]`) | `'Array'` (JSDoc has no tuple syntax; information goes in `@param` description) |
| **Conditional** | Contains ` extends ` and ` ? ` | `'*'` (too complex for JSDoc) |
| **Union** | Contains ` \| ` (outside of angle brackets) | Wrap in parens, remove spaces around `\|`: `'(A\|B)'` |
| **Generic** | Contains `<` and ends with `>` (e.g. `Array<string>`, `Map<string, number>`) | Insert `.` before `<`: `'Array.<string>'` |
| **Function with params** | Matches `(…) => ReturnType` | `'function(ParamTypes): ReturnType'` (extract param types, strip names) |
| **Fallback** | Anything not matched above | Pass through unchanged |

**Function type conversion details:**

`(x: string, y: number) => boolean` → `function(string, number): boolean`

Steps:
1. Match the pattern `(params) => returnType`
2. Split `params` by `,` — each is either `name: Type` or just `Type`
3. For each param, take only the type part (strip the `name: ` prefix if present)
4. Recombine: `function(Type1, Type2, …): ReturnType`

Edge cases:
- `() => void` → `function(): void`
- `(callback: (err: Error) => void) => void` → `function(function(Error): void): void` (nested function type, recursive application)

**Union type conversion details:**

Must only split on ` | ` that are **not** inside `<…>` (to avoid splitting generic type params like `Map<string, number | null>`). Use a depth counter when scanning the string.

Example:
- `string | number` → `(string|number)`
- `Array<string | number>` → `Array.<string|number>` (the `|` is inside `<>`, so union wrapping applies only inside the generic)

#### Examples

```ts
// Primitives — unchanged
tsTypeToJSDoc('string')           // 'string'
tsTypeToJSDoc('number')           // 'number'
tsTypeToJSDoc('boolean')          // 'boolean'
tsTypeToJSDoc('void')             // 'void'
tsTypeToJSDoc('null')             // 'null'
tsTypeToJSDoc('undefined')        // 'undefined'

// any / unknown → *
tsTypeToJSDoc('any')              // '*'
tsTypeToJSDoc('unknown')          // '*'

// Array shorthand — unchanged
tsTypeToJSDoc('string[]')         // 'string[]'
tsTypeToJSDoc('User[]')           // 'User[]'

// Tuple → Array
tsTypeToJSDoc('[string, number]') // 'Array'

// Conditional → *
tsTypeToJSDoc('T extends string ? A : B') // '*'

// Union → parenthesised, no spaces
tsTypeToJSDoc('string | number')           // '(string|number)'
tsTypeToJSDoc('string | number | boolean') // '(string|number|boolean)'
tsTypeToJSDoc('string | null')             // '(string|null)'

// Generic → dot notation
tsTypeToJSDoc('Array<string>')             // 'Array.<string>'
tsTypeToJSDoc('Promise<void>')             // 'Promise.<void>'
tsTypeToJSDoc('Map<string, number>')       // 'Map.<string, number>'
tsTypeToJSDoc('Record<string, number>')    // 'Record.<string, number>'
tsTypeToJSDoc('Partial<User>')             // 'Partial.<User>'

// Generic with union inside
tsTypeToJSDoc('Array<string | number>')    // 'Array.<(string|number)>'

// Function types
tsTypeToJSDoc('() => void')                      // 'function(): void'
tsTypeToJSDoc('(x: string) => boolean')          // 'function(string): boolean'
tsTypeToJSDoc('(a: string, b: number) => string')// 'function(string, number): string'
tsTypeToJSDoc('(callback: () => void) => void')  // 'function(function(): void): void'
```

---

### 2. Modified: `src/jsdoc.ts` — use `tsTypeToJSDoc` in JS mode

Current JS-mode JSDoc line:
```ts
lines.push(` * @param {${p.tsType}} ${p.name} - ${desc}`);
```

Updated:
```ts
lines.push(` * @param {${tsTypeToJSDoc(p.tsType)}} ${p.name} - ${desc}`);
```

Same change for the `@returns` tag:
```ts
// Before:
lines.push(` * @returns {${returnType}} ${returnDescription}`);
// After:
lines.push(` * @returns {${tsTypeToJSDoc(returnType)}} ${returnDescription}`);
```

Import added to the top of `jsdoc.ts`:
```ts
import { tsTypeToJSDoc } from './type-utils.js';
```

**TypeScript mode is unchanged** — TS mode already emits `@param name - desc` with no type braces, which is correct for TypeScript.

---

### 3. Modified: `src/types.ts` — add `returnPlaceholder?` to `ScaffoldFunctionConfig`

Add one optional field:

```ts
export type ScaffoldFunctionConfig = {
  // … existing fields …

  /**
   * Optional raw source expression for the placeholder `return` statement.
   *
   * When set, this string is used verbatim as the return value in the
   * generated source file and as the expected value in the wiring test,
   * instead of serializing `exampleOutput` with `toSourceLiteral`.
   *
   * Use this when `outputType` is a function type or any other type whose
   * example value cannot be expressed as a JSON-like literal.
   *
   * @example
   * // Scaffold a function that returns a function
   * returnPlaceholder: '(_name) => prefix'
   * // generates:  return (_name) => prefix;
   * // test uses:  assert.strictEqual(typeof result, 'function');
   */
  returnPlaceholder?: string;
};
```

`exampleOutput` **remains required** as a type-level contract for serializable outputs. `returnPlaceholder` is the escape hatch for non-serializable ones. When both are provided, `returnPlaceholder` wins for the generated source and test.

---

### 4. Modified: `src/scaffold.ts` — use `returnPlaceholder` when provided

In `scaffold.ts`, where the `return` statement is assembled:

```ts
// Before:
const returnValue = toSourceLiteral(config.exampleOutput);

// After:
const returnValue = config.returnPlaceholder ?? toSourceLiteral(config.exampleOutput);
```

Pass `returnPlaceholder` through to `testTemplateGenerator` so the test can adapt its assertion.

---

### 5. Modified: `src/test-template.ts` — adapt assertion when `returnPlaceholder` is set

`testTemplateGenerator` receives one new optional parameter: `returnPlaceholder?: string`.

```ts
export function testTemplateGenerator(
  funcName: string,
  paramDefs: ParamDef[],
  exampleOutput: unknown,
  language: Language = 'ts',
  returnPlaceholder?: string,   // NEW
): string { … }
```

When `returnPlaceholder` is provided, the wiring test uses a type-check assertion instead of `deepEqual`:

```ts
// returnPlaceholder NOT set (existing behaviour):
assert.deepEqual(myFunc("arg"), expectedOutput);

// returnPlaceholder IS set:
const result = myFunc("arg");
assert.strictEqual(typeof result, 'function', 'myFunc should return a function');
```

The second `TODO` placeholder test remains unchanged.

---

## Generated Output Examples

### Union param + union return (JS mode)

```ts
scaffoldFunction({
  name: 'coerce',
  language: 'js',
  paramDefs: [{ name: 'value', tsType: 'string | number', example: 42, description: 'Value to coerce' }],
  outputType: 'string | null',
  exampleOutput: '42',
})
```

Generated `coerce.js`:
```js
/**
 * TODO: Describe the function purpose.
 * @param {(string|number)} value - Value to coerce
 * @returns {(string|null)} Expected return type for this scaffold
 */
export function coerce(value) {
  return "42";
}
```

### Generic param (JS mode)

```ts
scaffoldFunction({
  name: 'firstItem',
  language: 'js',
  paramDefs: [{ name: 'items', tsType: 'Array<string>', example: ['a', 'b'] }],
  outputType: 'string | undefined',
  exampleOutput: 'a',
})
```

Generated `firstItem.js`:
```js
/**
 * TODO: Describe the function purpose.
 * @param {Array.<string>} items - items
 * @returns {(string|undefined)} Expected return type for this scaffold
 */
export function firstItem(items) {
  return "a";
}
```

### Function-returning function (TS mode, `returnPlaceholder`)

```ts
scaffoldFunction({
  name: 'makeGreeter',
  language: 'ts',
  paramDefs: [{ name: 'prefix', tsType: 'string', example: 'Hello' }],
  outputType: '(name: string) => string',
  exampleOutput: null,
  returnPlaceholder: '(_name) => prefix',
})
```

Generated `makeGreeter.ts`:
```ts
/**
 * TODO: Describe the function purpose.
 * @param prefix - prefix
 * @returns Expected return type for this scaffold
 */
export function makeGreeter(prefix: string): (name: string) => string {
  return (_name) => prefix;
}
```

Generated `makeGreeter.test.ts`:
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeGreeter } from './makeGreeter.js';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  const result = makeGreeter("Hello");
  assert.strictEqual(typeof result, 'function', 'makeGreeter should return a function');
});

test('TODO: add edge cases after implementation', () => {
  // Example: invalid prefix cases should be asserted here.
  assert.ok(true);
});
```

### Tuple param (JS mode)

```ts
scaffoldFunction({
  name: 'parseCoords',
  language: 'js',
  paramDefs: [{ name: 'coords', tsType: '[number, number]', example: [1, 2] }],
  outputType: 'string',
  exampleOutput: '1,2',
})
```

Generated JSDoc `@param` line:
```js
 * @param {Array} coords - coords
```
(Tuple falls back to `Array` in JSDoc; the description field should clarify the shape.)

---

## Testing Strategy

| File | What to test |
|---|---|
| `src/type-utils.test.ts` | Every conversion rule in the table above: primitives, `any`/`unknown`, `[]`, tuples, conditionals, unions, generics, function types, nested function types. At least one test per row. |
| `src/jsdoc.test.ts` (extended) | New JS-mode cases: union param, generic param, function-type param, tuple param, conditional return. Existing tests must still pass. |
| `src/scaffold.test.ts` (extended) | `returnPlaceholder` sets the correct return statement; wiring test uses `typeof` assertion; TS-mode + JS-mode both work with `returnPlaceholder`. |
| `src/test-template.test.ts` (extended) | `returnPlaceholder` produces `typeof result` assertion; absence of `returnPlaceholder` produces `deepEqual` assertion (existing tests). |

Run with: `node --import tsx/esm --test src/*.test.ts`

---

## Boundaries

**Always:**
- Use `.js` extensions in all ESM import specifiers within `.ts` files.
- Keep `dependencies` in `package.json` empty — no new runtime dependencies.
- Throw `Error` with the prefix `tsTypeToJSDoc: ` for any input that is clearly invalid (e.g., an empty string).
- Export `tsTypeToJSDoc` from `src/index.ts`.
- Run `node --import tsx/esm --test src/*.test.ts` before committing.
- All existing Phase 1 tests must continue to pass without modification.

**Ask first:**
- Changing the fallback behavior for types not matched by any rule (currently pass-through; could be a warning or error).
- Adding full TypeScript AST parsing (e.g., pulling in a `ts-morph` dependency) to handle edge cases.
- Changing the `returnPlaceholder` assertion from `typeof result` to something else.
- Supporting intersection types (`A & B`) with a non-`*` JSDoc rendering.

**Never:**
- Add runtime dependencies to `package.json`.
- Modify the behavior of `scaffoldFunction` for inputs that Phase 1 already handles — no regressions.
- Change the public shape of `ScaffoldFunctionResult`.
- Use `eval` or dynamic `Function` construction in `tsTypeToJSDoc`.

---

## Success Criteria

- [ ] `tsTypeToJSDoc('string | number')` returns `'(string|number)'`.
- [ ] `tsTypeToJSDoc('Array<string>')` returns `'Array.<string>'`.
- [ ] `tsTypeToJSDoc('(x: string) => boolean')` returns `'function(string): boolean'`.
- [ ] `tsTypeToJSDoc('[string, number]')` returns `'Array'`.
- [ ] `tsTypeToJSDoc('T extends string ? A : B')` returns `'*'`.
- [ ] `tsTypeToJSDoc('any')` and `tsTypeToJSDoc('unknown')` both return `'*'`.
- [ ] `scaffoldFunction` with `language: 'js'` and a union `paramDef.tsType` produces `@param {(string|number)}` in the JSDoc.
- [ ] `scaffoldFunction` with `language: 'js'` and a generic `paramDef.tsType` produces `@param {Array.<string>}` in the JSDoc.
- [ ] `scaffoldFunction` with `language: 'js'` and a function `outputType` produces `@returns {function(…): …}` in the JSDoc.
- [ ] `scaffoldFunction` with `returnPlaceholder` set generates the placeholder string in the `return` statement.
- [ ] `scaffoldFunction` with `returnPlaceholder` set generates `assert.strictEqual(typeof result, 'function', …)` in the wiring test.
- [ ] `scaffoldFunction` without `returnPlaceholder` behaves exactly as in Phase 1 (no regression).
- [ ] `tsTypeToJSDoc` is exported from `src/index.ts`.
- [ ] `node --import tsx/esm --test src/*.test.ts` exits 0, all tests pass (old + new).
- [ ] `npx tsc --noEmit` exits 0.

---

## Implementation Plan (5 Tasks)

### Task 1 — `src/type-utils.ts`: implement `tsTypeToJSDoc`

**Description:** New file. Export `tsTypeToJSDoc(tsType: string): string` implementing the conversion rules in the table above. No imports needed beyond TypeScript types.

**Acceptance criteria:**
- [ ] All conversion rules covered (primitives, any/unknown, `[]`, tuples, conditionals, unions, generics, function types).
- [ ] All examples in the "Conversion rules" table produce the documented outputs.
- [ ] `npx tsc --noEmit` passes.

**Dependencies:** None  
**Files:** `src/type-utils.ts`, `src/type-utils.test.ts`

---

### Task 2 — `src/jsdoc.ts`: integrate `tsTypeToJSDoc`

**Description:** Replace the two verbatim `${p.tsType}` / `${returnType}` expansions in JS mode with `tsTypeToJSDoc(p.tsType)` and `tsTypeToJSDoc(returnType)`. Import `tsTypeToJSDoc` from `./type-utils.js`.

**Acceptance criteria:**
- [ ] `toJSDOC([{ name:'x', tsType:'string | number', … }], 'boolean', 'js')` emits `@param {(string|number)} x`.
- [ ] `toJSDOC([], 'Array<string>', 'js')` emits `@returns {Array.<string>}`.
- [ ] All existing `jsdoc.test.ts` tests still pass (no regressions).

**Dependencies:** Task 1  
**Files:** `src/jsdoc.ts`, `src/jsdoc.test.ts`

---

### Task 3 — `src/types.ts`: add `returnPlaceholder?`

**Description:** Add the `returnPlaceholder?: string` optional field to `ScaffoldFunctionConfig` with its JSDoc block. No logic changes.

**Acceptance criteria:**
- [ ] `ScaffoldFunctionConfig` exports the new optional field.
- [ ] `npx tsc --noEmit` passes.
- [ ] Existing consumers of `ScaffoldFunctionConfig` compile without changes.

**Dependencies:** None (can be done in parallel with Task 1)  
**Files:** `src/types.ts`

---

### Task 4 — `src/test-template.ts` + `src/scaffold.ts`: wire `returnPlaceholder`

**Description:**
- `testTemplateGenerator`: add fifth parameter `returnPlaceholder?: string`. When set, generate `const result = fn(args); assert.strictEqual(typeof result, 'function', '…')` instead of `assert.deepEqual(fn(args), expected)`.
- `scaffold.ts`: pass `config.returnPlaceholder` to both the return-value expression and `testTemplateGenerator`. Prefer `returnPlaceholder` over `toSourceLiteral(exampleOutput)` when set.

**Acceptance criteria:**
- [ ] `scaffoldFunction({ …, returnPlaceholder: '(_n) => n' })` generates `return (_n) => n;` in source.
- [ ] Same config generates `const result = fn(…); assert.strictEqual(typeof result, 'function', …)` in test.
- [ ] All existing `scaffold.test.ts` and `test-template.test.ts` tests still pass.

**Dependencies:** Tasks 1–3  
**Files:** `src/test-template.ts`, `src/test-template.test.ts`, `src/scaffold.ts`, `src/scaffold.test.ts`

---

### Task 5 — `src/index.ts`: export `tsTypeToJSDoc`

**Description:** Add `export { tsTypeToJSDoc } from './type-utils.js';` to the public entry point.

**Acceptance criteria:**
- [ ] `import { tsTypeToJSDoc } from './index.js'` resolves at type-check time.
- [ ] All other Phase 1 exports remain unchanged.

**Dependencies:** Task 1  
**Files:** `src/index.ts`

---

### Checkpoint — All tasks complete

- [ ] `node --import tsx/esm --test src/*.test.ts` exits 0, all tests pass.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` produces `dist/` without errors.
- [ ] All success criteria above are met.
- [ ] Zero regressions: every Phase 1 test still passes without modification.

---

## Open Questions

1. **Intersection types (`A & B`):** JSDoc has no direct equivalent. Currently falls through to pass-through (outputs `{A & B}` verbatim). Should this become `{*}` or attempt to render as the first type? _Recommendation: leave as pass-through for now; file a follow-up if IDEs reject it._

2. **Nested generics with unions inside** (`Map<string, number | null>`): The current conversion applies union-wrapping inside generics, producing `Map.<string, (number|null)>`. Is this the desired output? _Recommendation: yes, it is the most information-preserving option._

3. **`exampleOutput` type constraint:** Now that `returnPlaceholder` exists, should `exampleOutput` become optional when `returnPlaceholder` is set? _Recommendation: keep `exampleOutput` required for now (easier to make required→optional than optional→required); revisit in Phase 3 if the friction is real._

---

## References

- [`plan.md`](../../plan.md) — authoritative phase definitions
- [Phase 1 source files](../../src/) — all conventions come from here
- [`src/jsdoc.ts`](../../src/jsdoc.ts) — the primary file being extended
- [`src/types.ts`](../../src/types.ts) — `ScaffoldFunctionConfig` being extended
- [spec-driven-development skill](../../.github/skills/spec-driven-development/SKILL.md)
- [test-driven-development skill](../../.github/skills/test-driven-development/SKILL.md)
- [incremental-implementation skill](../../.github/skills/incremental-implementation/SKILL.md)
