---
description: Simplify code for clarity and maintainability — reduce complexity without changing behavior
mode: agent
---

Simplify the recently changed code (or the scope I specify) while preserving exact behavior.

1. Read `AGENTS.md` and study the project conventions (ESM-only, `node:test`, no runtime deps)
2. Identify the target code — recent changes unless a broader scope is specified
3. Understand the code's purpose, callers, edge cases, and test coverage before touching it
4. Scan for simplification opportunities:
   - Deep nesting → guard clauses or extracted helpers
   - Long functions → split by responsibility
   - Nested ternaries → `if`/`else` or `switch`
   - Generic names → descriptive names
   - Duplicated logic → shared functions
   - Dead code → remove after confirming unused
5. Apply each simplification incrementally — run `node --import tsx/esm --test src/*.test.ts` after each change
6. Verify all tests pass, the build succeeds (`npm run build`), and the diff is clean

If tests fail after a simplification, revert that change and reconsider.

#file:.github/skills/code-simplification/SKILL.md
#file:.github/skills/code-review-and-quality/SKILL.md
