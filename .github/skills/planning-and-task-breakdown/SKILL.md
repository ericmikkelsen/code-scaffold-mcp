---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---

# Planning and Task Breakdown

## Overview

Decompose work into small, verifiable tasks with explicit acceptance criteria.

## The Planning Process

1. **Enter Plan Mode** — Read-only, no code yet.
2. **Identify the Dependency Graph** — Map what depends on what.
3. **Slice Vertically** — Build one complete feature path at a time.
4. **Write Tasks** — Each task has description, acceptance criteria, verification, dependencies, files, and scope estimate.
5. **Order and Checkpoint** — Arrange tasks so dependencies are satisfied.

## Task Template

```markdown
## Task [N]: [Short descriptive title]

**Acceptance criteria:**
- [ ] [Specific, testable condition]

**Verification:**
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`

**Dependencies:** [Task numbers this depends on, or "None"]

**Files likely touched:**
- `src/path/to/file.ts`
```

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
