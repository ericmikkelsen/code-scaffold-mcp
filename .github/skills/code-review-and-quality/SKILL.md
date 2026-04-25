---
name: code-review-and-quality
description: Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters the main branch.
---

# Code Review and Quality

## Overview

Multi-dimensional code review with quality gates. Every change gets reviewed before merge — no exceptions. Review covers five axes: correctness, readability, architecture, security, and performance.

## The Five-Axis Review

1. **Correctness** — Does the code do what it claims?
2. **Readability & Simplicity** — Can another engineer understand this without help?
3. **Architecture** — Does the change fit the system's design?
4. **Security** — Does the change introduce vulnerabilities?
5. **Performance** — Does the change introduce performance problems?

## Verification

After review is complete:

- [ ] All Critical issues are resolved
- [ ] All Important issues are resolved or explicitly deferred
- [ ] Tests pass
- [ ] Build succeeds
- [ ] The verification story is documented
