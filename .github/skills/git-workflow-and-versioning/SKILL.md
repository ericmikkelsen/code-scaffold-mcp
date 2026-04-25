---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, or when you need to organize work across multiple parallel streams.
---

# Git Workflow and Versioning

## Overview

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation.

## Core Principles

1. **Commit Early, Commit Often** — Each successful increment gets its own commit.
2. **Atomic Commits** — Each commit does one logical thing.
3. **Descriptive Messages** — Commit messages explain the *why*, not just the *what*.
4. **Keep Concerns Separate** — Don't combine formatting changes with behavior changes.
5. **Size Your Changes** — Target ~100 lines per commit/PR.

## Commit Message Format

```
<type>: <short description>

<optional body explaining why, not what>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Verification

For every commit:

- [ ] Commit does one logical thing
- [ ] Message explains the why, follows type conventions
- [ ] Tests pass before committing
- [ ] No secrets in the diff
