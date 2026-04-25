# Spec: Phase 2 — `scaffoldComponent`

> Written using the [spec-driven-development](../../.github/skills/spec-driven-development/SKILL.md) skill.

---

## Objective

Add a `scaffoldComponent` function to `code-scaffold-mcp` that generates UI component skeletons — currently for **React** and **Vue** — with typed props and a minimal render stub. The output is identical in spirit to `scaffoldFunction`: a source file plus a companion test file that wires the function correctly from day one, with a `// TODO` placeholder for the real render logic.

**Who is the user?**  
An AI agent (or a developer using the library programmatically) that needs to spin up a new UI component with the correct type structure and a passing wiring test. The agent fills in the render body once scaffolding is done.

**What does success look like?**  
- A developer (or agent) calls `scaffoldComponent({ name: 'Button', framework: 'react', … })` and gets back a complete React `.tsx` component with typed `Props` and a test that imports and mounts the component.
- Calling `scaffoldComponent({ name: 'MyCard', framework: 'vue', … })` produces a valid Vue SFC (`.vue`) and a companion test.
- The generated files are byte-for-byte reproducible — same input always produces the same output.
- The companion test is runnable immediately (green on first run) and provides clear coverage of prop wiring.

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
| React version targeted | React 18 (JSX, `React.FC`, `React.ReactNode`) |
| Vue version targeted | Vue 3 (Composition API, `<script setup>`, `defineProps`) |

---

## Commands

```
Build:   npm run build
Test:    node --import tsx/esm --test src/*.test.ts
Typecheck: npx tsc --noEmit
```

---

## Project Structure

```
src/
  scaffold.ts            ← existing scaffoldFunction (unchanged)
  scaffold-component.ts  ← new: scaffoldComponent implementation
  component-template.ts  ← new: generates the component source string
  component-test-template.ts  ← new: generates the companion test string
  types.ts               ← extended: add ScaffoldComponentConfig + ScaffoldComponentResult
  index.ts               ← extended: re-export new public API
  scaffold-component.test.ts  ← new: tests for scaffoldComponent
  component-template.test.ts  ← new: tests for component-template generator
  component-test-template.test.ts  ← new: tests for test-template generator

docs/
  specs/
    phase-2-scaffold-component.md   ← this file
```

---

## Code Style

The Phase 2 code must be written in the same style as Phase 1. One illustrative example:

```ts
// src/scaffold-component.ts
import { toComponentSource } from './component-template.js';
import { toComponentTestSource } from './component-test-template.js';
import type { ScaffoldComponentConfig, ScaffoldComponentResult } from './types.js';

/**
 * Scaffolds a UI component with typed props and a companion test file.
 *
 * @param config - Scaffold configuration (name, framework, propDefs, language)
 * @returns `{ fileName, testFileName, source, testSource }`
 * @throws {Error} If `name` is not a valid JavaScript identifier or is a reserved keyword
 *
 * @example
 * const result = scaffoldComponent({
 *   name: 'Button',
 *   framework: 'react',
 *   language: 'ts',
 *   propDefs: [{ name: 'label', tsType: 'string', example: 'Click me' }],
 * });
 * // result.fileName → 'Button.tsx'
 */
export function scaffoldComponent(config: ScaffoldComponentConfig): ScaffoldComponentResult {
  // ...
}
```

**Key conventions (carry over from Phase 1):**

- `.js` extensions on all ESM imports, even in `.ts` files.
- No runtime dependencies — `dependencies` in `package.json` remains empty.
- JSDoc on every public export: `@param`, `@returns`, `@throws`, `@example`.
- Tests colocated with source as `*.test.ts`.
- Errors thrown with the function name prefix: `scaffoldComponent: …`.
- `toSourceLiteral` from `utils.ts` for serialising example values.

---

## API Design

### New types in `src/types.ts`

```ts
/** Supported UI frameworks for scaffoldComponent */
export type Framework = 'react' | 'vue';

/** A single prop definition — the component analogue of ParamDef */
export type PropDef = {
  /** Valid JS identifier for the prop name */
  name: string;
  /** TypeScript type string, e.g. 'string', 'boolean', '() => void' */
  tsType: string;
  /** Concrete JS value used in the wiring test and @example JSDoc */
  example: unknown;
  /** Optional description for the generated JSDoc @prop line */
  description?: string;
  /** Whether the prop is optional (adds '?' to the Props type). Defaults to false. */
  optional?: boolean;
};

/** Configuration for scaffoldComponent() */
export type ScaffoldComponentConfig = {
  /** Valid PascalCase (or camelCase) identifier for the component name */
  name: string;
  /** Target UI framework */
  framework: Framework;
  /** Output language. 'ts' emits .tsx / .vue with <script setup lang="ts">.
   *  'js' emits .jsx / .vue without type annotations. */
  language: Language;
  /** Props the component accepts. Pass [] for a zero-prop component. */
  propDefs: PropDef[];
  /**
   * Optional one-line description of what the component renders.
   * Used in the JSDoc summary and the generated @example block.
   */
  description?: string;
};

/** Return value from scaffoldComponent() */
export type ScaffoldComponentResult = {
  /** e.g. 'Button.tsx', 'Button.jsx', 'MyCard.vue' */
  fileName: string;
  /** e.g. 'Button.test.tsx', 'MyCard.test.ts' */
  testFileName: string;
  /** Complete source of the generated component file */
  source: string;
  /** Complete source of the generated test file */
  testSource: string;
};
```

### Generated output format (React, TS)

Given:
```ts
scaffoldComponent({
  name: 'Button',
  framework: 'react',
  language: 'ts',
  propDefs: [
    { name: 'label', tsType: 'string', example: 'Click me', description: 'Button text' },
    { name: 'onClick', tsType: '() => void', example: '() => {}', optional: true },
  ],
  description: 'A simple button component',
})
```

`Button.tsx` (source):
```tsx
import React from 'react';

export type ButtonProps = {
  /** Button text */
  label: string;
  onClick?: () => void;
};

/**
 * A simple button component
 *
 * @example
 * <Button label="Click me" />
 */
export function Button({ label, onClick }: ButtonProps): React.ReactNode {
  // TODO: implement Button
  return null;
}
```

`Button.test.tsx` (testSource):
```tsx
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Button } from './Button.js';

test('Button is a function', () => {
  assert.strictEqual(typeof Button, 'function');
});

test('Button accepts expected props shape', () => {
  const props = { label: 'Click me' };
  assert.doesNotThrow(() => Button(props));
});
```

### Generated output format (Vue, TS)

Given:
```ts
scaffoldComponent({
  name: 'MyCard',
  framework: 'vue',
  language: 'ts',
  propDefs: [
    { name: 'title', tsType: 'string', example: 'Hello' },
  ],
})
```

`MyCard.vue` (source):
```vue
<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <!-- TODO: implement MyCard -->
  <div />
</template>
```

`MyCard.test.ts` (testSource):
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Vue SFCs require a compile step; this test verifies the module can be imported
// and that the component definition object is present.
test('MyCard module exports a component object', async () => {
  // Wiring check — replace with a full mount test after installing @vue/test-utils
  assert.ok(true, 'MyCard scaffold wiring test placeholder');
});
```

> **Note on Vue test strategy:** Full Vue SFC mounting requires `@vue/test-utils` + a transformer, which are not in `devDependencies` yet. The generated wiring test is a placeholder that documents the intent and passes immediately. A follow-up task (tracked as an open question below) adds the real mount test infrastructure.

---

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit | `scaffoldComponent` input validation (bad name, reserved word) | `node:test` + `node:assert/strict` |
| Unit | `toComponentSource` — verify output string for each framework × language combination | `node:test` snapshot-style string comparison |
| Unit | `toComponentTestSource` — verify test string for each combination | `node:test` string comparison |
| Integration | Round-trip: call `scaffoldComponent`, write files to `/tmp`, `node --import tsx/esm` the test file | `node:test` child_process or direct eval |

Test files colocated with source: `src/*.test.ts`.

Run with: `node --import tsx/esm --test src/*.test.ts`

---

## Boundaries

**Always:**
- Use `.js` extensions in all ESM import specifiers within `.ts` files.
- Keep `dependencies` in `package.json` empty — no new runtime deps.
- Throw `Error` with the prefix `scaffoldComponent: ` for all validation failures.
- Export all new public types from `src/index.ts`.
- Run `node --import tsx/esm --test src/*.test.ts` before committing.

**Ask first:**
- Adding `@vue/test-utils` or any test utility to `devDependencies`.
- Changing the file-extension logic for Vue (`.vue` vs `.ts` companion test).
- Supporting frameworks beyond React and Vue (e.g. Svelte, Solid).
- Supporting CSS module or style import generation.
- Changing the JSDoc comment style.

**Never:**
- Add runtime dependencies to `package.json`.
- Generate files that fail TypeScript's `noEmit` check.
- Modify existing `scaffoldFunction` behaviour — Phase 1 is stable and must not regress.
- Skip tests or disable assertions to make tests pass.

---

## Success Criteria

- [ ] `scaffoldComponent({ name: 'Button', framework: 'react', language: 'ts', propDefs: [{name:'label', tsType:'string', example:'Click me'}] })` returns `{ fileName: 'Button.tsx', testFileName: 'Button.test.tsx', source: <valid TSX>, testSource: <valid TS test> }`.
- [ ] `scaffoldComponent({ name: 'MyCard', framework: 'vue', language: 'ts', propDefs: [{name:'title', tsType:'string', example:'Hello'}] })` returns `{ fileName: 'MyCard.vue', testFileName: 'MyCard.test.ts', source: <valid SFC>, testSource: <valid TS test> }`.
- [ ] JS language variants (`language: 'js'`) produce `.jsx` / `.vue` without type annotations.
- [ ] Invalid `name` (empty, reserved word, non-identifier) throws `Error` with descriptive message.
- [ ] Zero-prop components are supported: `propDefs: []`.
- [ ] `optional: true` on a `PropDef` adds `?` to the generated Props type.
- [ ] All new functions and types are exported from `src/index.ts`.
- [ ] `node --import tsx/esm --test src/*.test.ts` exits 0 with no failing tests.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] Existing Phase 1 tests continue to pass without modification.

---

## Implementation Plan (Phase 2: Tasks)

### Task 1 — Extend `src/types.ts` with component types

**Description:** Add `Framework`, `PropDef`, `ScaffoldComponentConfig`, and `ScaffoldComponentResult` types.

**Acceptance criteria:**
- [ ] All four types are exported from `src/types.ts`.
- [ ] `npx tsc --noEmit` passes.

**Dependencies:** None  
**Files:** `src/types.ts`

---

### Task 2 — Implement `src/component-template.ts`

**Description:** Export `toComponentSource(config: ScaffoldComponentConfig): string` that renders the full component source (React TSX/JSX or Vue SFC) as a string.

**Acceptance criteria:**
- [ ] React TS output matches the expected snapshot in `component-template.test.ts`.
- [ ] React JS output omits type annotations and uses `.jsx` conventions.
- [ ] Vue TS output uses `<script setup lang="ts">` + `defineProps<{…}>()`.
- [ ] Vue JS output uses `<script setup>` + `defineProps({…})`.
- [ ] Zero-prop case: React renders `function Foo(): React.ReactNode { return null; }` with no Props type; Vue renders `<script setup lang="ts"></script>`.

**Dependencies:** Task 1  
**Files:** `src/component-template.ts`, `src/component-template.test.ts`

---

### Task 3 — Implement `src/component-test-template.ts`

**Description:** Export `toComponentTestSource(config: ScaffoldComponentConfig): string` that renders the companion test file as a string.

**Acceptance criteria:**
- [ ] React test imports the component and asserts `typeof Component === 'function'`.
- [ ] React test calls the component with example prop values and asserts `doesNotThrow`.
- [ ] Vue test is a placeholder wiring test that passes immediately.
- [ ] Test file uses `node:test` and `node:assert/strict`.

**Dependencies:** Task 1  
**Files:** `src/component-test-template.ts`, `src/component-test-template.test.ts`

---

### Task 4 — Implement `src/scaffold-component.ts`

**Description:** Export `scaffoldComponent(config: ScaffoldComponentConfig): ScaffoldComponentResult`. Validates `name`, computes file names, delegates to `toComponentSource` and `toComponentTestSource`.

**File name rules:**
- React TS: `<Name>.tsx` / `<Name>.test.tsx`
- React JS: `<Name>.jsx` / `<Name>.test.jsx`
- Vue TS: `<Name>.vue` / `<Name>.test.ts`
- Vue JS: `<Name>.vue` / `<Name>.test.js`

**Acceptance criteria:**
- [ ] Returns correct `fileName` and `testFileName` for all 4 framework × language combinations.
- [ ] Throws `Error: scaffoldComponent: name '<x>' is not a valid JavaScript identifier` for bad names.
- [ ] Throws `Error: scaffoldComponent: name '<x>' is a reserved JavaScript keyword` for reserved words.
- [ ] `source` and `testSource` are non-empty strings.

**Dependencies:** Tasks 1–3  
**Files:** `src/scaffold-component.ts`, `src/scaffold-component.test.ts`

---

### Task 5 — Wire into `src/index.ts`

**Description:** Re-export `scaffoldComponent` and all new types from the public entry point.

**Acceptance criteria:**
- [ ] `import { scaffoldComponent, ScaffoldComponentConfig, ScaffoldComponentResult, Framework, PropDef } from './index.js'` works.
- [ ] Phase 1 exports are unchanged.

**Dependencies:** Task 4  
**Files:** `src/index.ts`

---

### Checkpoint — All tasks complete

- [ ] `node --import tsx/esm --test src/*.test.ts` exits 0, all tests pass.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] All success criteria above are met.
- [ ] Phase 1 tests still pass.

---

## Open Questions

1. **Vue wiring test:** Should we add `@vue/test-utils` (+ `happy-dom` or `jsdom`) to `devDependencies` for a real mount test, or keep the placeholder and defer that to a subsequent PR? _Recommendation: placeholder now, real mount test in a follow-up._

2. **Prop default values:** Should `PropDef` include an optional `defaultValue` that is rendered into the component? Deferred — not in MVP.

3. **`children` / slot support:** React's `children` prop and Vue's default `<slot>` are common but add complexity. Deferred — not in MVP.

4. **CSS Modules / scoped styles:** Should the Vue SFC scaffold a `<style scoped>` block? Deferred — not in MVP.

5. **Svelte / Solid support:** Out of scope for Phase 2; extensible via the `Framework` union type.

---

## References

- [Phase 1 implementation](../../src/scaffold.ts) — follow the same patterns for validation, JSDoc generation, and test-template generation.
- [spec-driven-development skill](../../.github/skills/spec-driven-development/SKILL.md)
- [api-and-interface-design skill](../../.github/skills/api-and-interface-design/SKILL.md)
- [test-driven-development skill](../../.github/skills/test-driven-development/SKILL.md)
- [incremental-implementation skill](../../.github/skills/incremental-implementation/SKILL.md)
