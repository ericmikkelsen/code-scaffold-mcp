---
name: code-simplification
description: Simplifies code for clarity. Use when refactoring code for clarity without changing behavior. Use when code works but is harder to read, maintain, or extend than it should be.
---

# Code Simplification

## Overview

Simplify code by reducing complexity while preserving exact behavior. The goal is not fewer lines — it's code that is easier to read, understand, modify, and debug.

## The Five Principles

1. **Preserve Behavior Exactly** — Don't change what the code does.
2. **Follow Project Conventions** — Match the codebase's style.
3. **Prefer Clarity Over Cleverness** — Explicit code beats compact code.
4. **Maintain Balance** — Don't over-simplify.
5. **Scope to What Changed** — Default to simplifying recently modified code.

## Verification

After completing a simplification pass:

- [ ] All existing tests pass without modification
- [ ] Build succeeds with no new warnings
- [ ] Each simplification is a reviewable, incremental change
- [ ] Simplified code follows project conventions
- [ ] No error handling was removed or weakened
