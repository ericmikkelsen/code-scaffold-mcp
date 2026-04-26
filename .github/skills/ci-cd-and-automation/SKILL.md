---
name: ci-cd-and-automation
description: Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.
---

# CI/CD and Automation

## Overview

Automate quality gates so that no change reaches production without passing tests, lint, type checking, and build.

**Shift Left:** Catch problems as early in the pipeline as possible.

**Faster is Safer:** Smaller batches and more frequent releases reduce risk.

## The Quality Gate Pipeline

Every change goes through these gates before merge: lint → type check → unit tests → build → integration → e2e (optional) → security audit.

**No gate can be skipped.**

## Verification

After setting up or modifying CI:

- [ ] All quality gates are present (lint, types, tests, build, audit)
- [ ] Pipeline runs on every PR and push to main
- [ ] Failures block merge (branch protection configured)
- [ ] Secrets are stored in the secrets manager, not in code
- [ ] Deployment has a rollback mechanism
- [ ] Pipeline runs in under 10 minutes for the test suite
