---
name: test-driven-development
description: Drives development with tests. Use when implementing any logic, fixing any bug, or changing any behavior. Use when you need to prove that code works, when a bug report arrives, or when you're about to modify existing functionality.
---

# Test-Driven Development

## Overview

Write a failing test before writing the code that makes it pass. Tests are proof — "seems right" is not done.

## The TDD Cycle

```
RED → GREEN → REFACTOR
```

1. **RED** — Write a failing test
2. **GREEN** — Write minimal code to make it pass
3. **REFACTOR** — Clean up without changing behavior

## The Prove-It Pattern (Bug Fixes)

When a bug is reported:
1. Write a test that reproduces the bug (it should FAIL)
2. Implement the fix
3. Test PASSES → bug fixed, regression guarded

## Writing Good Tests

- Test state, not interactions
- DAMP over DRY in tests (Descriptive And Meaningful Phrases)
- Prefer real implementations over mocks
- Use Arrange-Act-Assert pattern
- One assertion per concept
- Name tests descriptively

## Verification

After completing any implementation:

- [ ] Every new behavior has a corresponding test
- [ ] All tests pass: `npm test`
- [ ] Bug fixes include a reproduction test that failed before the fix
- [ ] Test names describe the behavior being verified
- [ ] No tests were skipped or disabled
