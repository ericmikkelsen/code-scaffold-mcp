---
description: Implement the next task incrementally — build, test, verify, commit
mode: agent
---

Follow the incremental implementation and test-driven development workflow for this repository.

Pick the next pending task from the plan (check `tasks/plan.md` or `tasks/todo.md` if present). For each task:

1. Read the task's acceptance criteria
2. Load relevant context (existing code, patterns, types in `src/`)
3. Write a failing test for the expected behavior (RED) — use `node:test` and `node:assert/strict` as per project conventions
4. Implement the minimum code to pass the test (GREEN)
5. Run the full test suite to check for regressions: `node --import tsx/esm --test src/*.test.ts`
6. Run the build to verify compilation: `npm run build`
7. Commit with a descriptive Conventional Commits message (e.g. `feat(scope): description`)
8. Mark the task complete and move to the next one

If any step fails, diagnose the root cause before making further changes. Revert a failing change rather than layering fixes on top of it.

#file:.github/skills/incremental-implementation/SKILL.md
#file:.github/skills/test-driven-development/SKILL.md
#file:.github/skills/debugging-and-error-recovery/SKILL.md
