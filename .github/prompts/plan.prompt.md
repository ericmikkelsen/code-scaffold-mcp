---
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
mode: ask
---

Read the existing spec (`SPEC.md` or equivalent) and the relevant codebase sections. Then produce a structured implementation plan.

1. Enter plan mode — read only, no code changes yet
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write each task with:
   - Clear acceptance criteria
   - Verification steps (how to confirm it's done)
   - Dependencies on other tasks
5. Add checkpoints between phases
6. Present the plan for human review before any code is written

Save the plan to `tasks/plan.md` and a numbered task list to `tasks/todo.md`.

#file:.github/skills/planning-and-task-breakdown/SKILL.md
#file:.github/skills/spec-driven-development/SKILL.md
