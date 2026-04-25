---
name: using-agent-skills
description: Discovers and invokes agent skills. Use when starting a session or when you need to discover which skill applies to the current task. This is the meta-skill that governs how all other skills are discovered and invoked.
---

# Using Agent Skills

## Skill Discovery

```
Task arrives
    ├── Vague idea/need refinement? ──→ idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
    ├── Implementing code? ────────────→ incremental-implementation
    │   ├── UI work? ─────────────────→ frontend-ui-engineering
    │   ├── API work? ────────────────→ api-and-interface-design
    │   └── Need doc-verified code? ───→ source-driven-development
    ├── Writing/running tests? ────────→ test-driven-development
    ├── Something broke? ──────────────→ debugging-and-error-recovery
    ├── Reviewing code? ───────────────→ code-review-and-quality
    ├── Committing/branching? ─────────→ git-workflow-and-versioning
    ├── CI/CD pipeline work? ──────────→ ci-cd-and-automation
    ├── Writing docs/ADRs? ───────────→ documentation-and-adrs
    └── Deploying/launching? ─────────→ shipping-and-launch
```

## Core Operating Behaviors

1. **Surface Assumptions** — State your assumptions before implementing anything non-trivial.
2. **Manage Confusion Actively** — Stop and ask when you encounter inconsistencies.
3. **Push Back When Warranted** — You are not a yes-machine.
4. **Enforce Simplicity** — Actively resist over-complication.
5. **Maintain Scope Discipline** — Touch only what you're asked to touch.
6. **Verify, Don't Assume** — A task is not complete until verification passes.

## Lifecycle Sequence

1. idea-refine
2. spec-driven-development
3. planning-and-task-breakdown
4. context-engineering
5. source-driven-development
6. incremental-implementation
7. test-driven-development
8. code-review-and-quality
9. git-workflow-and-versioning
10. documentation-and-adrs
11. shipping-and-launch
