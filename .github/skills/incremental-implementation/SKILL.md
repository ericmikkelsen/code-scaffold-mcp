---
name: incremental-implementation
description: Delivers changes incrementally. Use when implementing any feature or change that touches more than one file. Use when you're about to write a large amount of code at once, or when a task feels too big to land in one step.
---

# Incremental Implementation

## Overview

Build in thin vertical slices — implement one piece, test it, verify it, then expand. Each increment should leave the system in a working, testable state.

## The Increment Cycle

For each slice:
1. **Implement** the smallest complete piece of functionality
2. **Test** — run the test suite
3. **Verify** — confirm the slice works as expected
4. **Commit** — save your progress with a descriptive message
5. **Move to the next slice**

## Implementation Rules

- **Rule 0: Simplicity First** — What is the simplest thing that could work?
- **Rule 0.5: Scope Discipline** — Touch only what the task requires.
- **Rule 1: One Thing at a Time** — Each increment changes one logical thing.
- **Rule 2: Keep It Compilable** — After each increment, the project must build.
- **Rule 3: Feature Flags for Incomplete Features** — Merge increments without exposing incomplete work.

## Verification

After completing all increments for a task:

- [ ] Each increment was individually tested and committed
- [ ] The full test suite passes
- [ ] The build is clean
- [ ] The feature works end-to-end as specified
