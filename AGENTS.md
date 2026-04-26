# Agent Instructions

This file contains conventions and rules that all contributors — human or AI — must follow when working in this repository.

---

## Plan

The library is being built in five phases. Each phase ships as one or more PRs and adds a distinct scaffold target.

| Phase | Scope | Status |
|---|---|---|
| **1. Functions** | `scaffoldFunction` — generates typed function source + `node:test` template for TS and JS targets. | ✅ Done |
| **2. Components** | `scaffoldComponent` — generates UI component skeletons (e.g. React/Vue) with props types and a render stub. | 🔲 Planned |
| **3. Skill/Scaffold Hybrid** | Add behavior-focused prompt skill cards layered on top of minimal scaffolds to improve pass rate per token for edge-case-heavy tasks. | 🔲 Planned |
| **4. Schemas** | `scaffoldSchema` — generates schema definitions (e.g. Zod, JSON Schema) from a field-definition config. | 🔲 Planned |
| **5. MCP Server** | Expose all scaffold generators as an MCP-compliant server so agents can call them over the Model Context Protocol. | 🔲 Planned |

---

## Conventional Commits

All commit messages **must** follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification. The automated versioning workflow reads PR titles to determine the next semver bump, so correct commit types are required for releases to work properly.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                                      | Semver bump |
|------------|------------------------------------------------------------------|-------------|
| `feat`     | A new feature                                                    | **minor**   |
| `fix`      | A bug fix                                                        | **patch**   |
| `docs`     | Documentation changes only                                       | patch       |
| `refactor` | Code change that is neither a fix nor a feature                  | patch       |
| `perf`     | A code change that improves performance                          | patch       |
| `test`     | Adding or correcting tests                                       | patch       |
| `build`    | Changes to the build system or external dependencies             | patch       |
| `ci`       | Changes to CI configuration or scripts                          | patch       |
| `chore`    | Maintenance tasks (e.g. dependency updates, tooling)            | patch       |
| `style`    | Formatting, whitespace — no logic changes                       | patch       |

### Breaking Changes → major bump

Append `!` after the type/scope, **or** include `BREAKING CHANGE:` in the footer:

```
feat!: rename scaffoldFunction config field outputType to returnType

BREAKING CHANGE: The `outputType` field in ScaffoldFunctionConfig has been
renamed to `returnType`. Update all call sites accordingly.
```

Either syntax triggers a **major** version bump in the automated release workflow.

### Examples

```
feat(scaffold): add optional description field to ScaffoldFunctionConfig
fix(jsdoc): correct JSDoc @returns tag for JS language output
docs: add writeFile usage example to README
chore: upgrade tsx to v4.22
refactor(params): simplify toJSParams type narrowing
feat!: drop Node 18 support, require Node 20+
```

### PR Titles

The **PR title** is used as the primary signal for the versioning workflow. It must follow the same `<type>[scope]: <description>` format as a commit message. The merge commit will inherit this title.

---

## Scaffolding New Functions

When adding a **new exported function** to `src/`, use `scaffoldFunction` from the local source to generate the initial `.ts` source file and its companion `.test.ts` file. This keeps the function signature, JSDoc, and wiring test in sync from the start.

### How to run it

Write a one-off script in `/tmp/` (never commit it) and execute it with the `tsx/esm` loader:

```ts
// /tmp/scaffold-myFunc.ts
import { scaffoldFunction } from '/home/runner/work/code-scaffold-mcp/code-scaffold-mcp/src/index.js';
import { writeFileSync } from 'node:fs';

const result = scaffoldFunction({
  name: 'myFunc',
  language: 'ts',
  paramDefs: [
    { name: 'input', tsType: 'string', example: 'hello', description: 'The input string' },
  ],
  outputType: 'string',
  exampleOutput: 'HELLO',
});

const srcDir = '/home/runner/work/code-scaffold-mcp/code-scaffold-mcp/src';
writeFileSync(`${srcDir}/${result.fileName}`, result.source);
writeFileSync(`${srcDir}/${result.testFileName}`, result.testSource);
console.log('wrote', result.fileName, result.testFileName);
```

```sh
node --import tsx/esm /tmp/scaffold-myFunc.ts
```

### After scaffolding

1. Open `src/myFunc.ts` and replace the `// TODO` placeholder with the real implementation.
2. Update `src/index.ts` to export the new function.
3. Run the tests to confirm the wiring test passes: `node --import tsx/esm --test src/*.test.ts`

---

## Code Review

Every PR should be reviewed through two lenses:

### Senior Developer — Maintainability, Best Practices & Clarity

Look for:
- Code is clean, readable, and self-documenting (good naming, minimal surprises).
- Follows established patterns in the codebase (ESM imports, `node:test`, no runtime deps).
- No unnecessary complexity — prefer simple, direct solutions.
- Edge cases and error paths are handled.
- Tests cover the meaningful behavior, not just the happy path.

### Junior Developer — Ease of Use

Look for:
- Public API is intuitive and forgiving for a first-time user.
- Parameter names and types make intent obvious without needing to read the source.
- JSDoc examples are present and runnable as written.
- Error messages are descriptive enough to guide someone new to the library.
- `README` or inline docs reflect any new behavior so no prior context is required.

---

## General Coding Conventions

- **Language**: TypeScript-first. All source files live in `src/` and are compiled to `dist/`.
- **Module format**: ESM only (`"type": "module"` in `package.json`). Use `.js` extensions in imports even when authoring `.ts` files.
- **Tests**: Use Node's built-in `node:test` and `node:assert/strict`. Test files are colocated with source as `*.test.ts`.
- **No external runtime dependencies**: Keep `dependencies` empty; use `devDependencies` only.
