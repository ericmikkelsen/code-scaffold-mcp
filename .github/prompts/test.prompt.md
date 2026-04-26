---
description: Run TDD workflow — write failing tests, implement, verify. For bugs, use the Prove-It pattern.
mode: agent
---

Apply test-driven development using this repository's test stack: `node:test` + `node:assert/strict`, run with `node --import tsx/esm --test src/*.test.ts`.

**For new features:**
1. Write tests that describe the expected behavior (they should FAIL — confirm this)
2. Implement the minimum code to make them pass
3. Refactor while keeping tests green

**For bug fixes (Prove-It pattern):**
1. Write a test that reproduces the bug — it MUST fail before the fix
2. Confirm the test fails by running the suite
3. Implement the fix
4. Confirm the test now passes
5. Run the full suite to check for regressions: `node --import tsx/esm --test src/*.test.ts`

**Rules:**
- Tests live alongside source as `*.test.ts` in `src/`
- Use `node:assert/strict` — never add a test framework as a runtime dependency
- Test names must describe the behavior being verified, not the implementation
- Never skip or disable existing tests

#file:.github/skills/test-driven-development/SKILL.md
#file:.github/skills/debugging-and-error-recovery/SKILL.md
