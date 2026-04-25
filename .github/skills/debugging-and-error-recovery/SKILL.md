---
name: debugging-and-error-recovery
description: Guides systematic root-cause debugging. Use when tests fail, builds break, behavior doesn't match expectations, or you encounter any unexpected error.
---

# Debugging and Error Recovery

## Overview

Systematic debugging with structured triage. When something breaks, stop adding features, preserve evidence, and follow a structured process to find and fix the root cause.

## The Stop-the-Line Rule

1. STOP adding features or making changes
2. PRESERVE evidence (error output, logs, repro steps)
3. DIAGNOSE using the triage checklist
4. FIX the root cause
5. GUARD against recurrence
6. RESUME only after verification passes

## The Triage Checklist

1. **Reproduce** — Make the failure happen reliably
2. **Localize** — Narrow down WHERE the failure happens
3. **Reduce** — Create the minimal failing case
4. **Fix the Root Cause** — Fix the underlying issue, not the symptom
5. **Guard Against Recurrence** — Write a test that catches this failure
6. **Verify End-to-End** — After fixing, verify the complete scenario

## Verification

After fixing a bug:

- [ ] Root cause is identified and documented
- [ ] Fix addresses the root cause, not just symptoms
- [ ] A regression test exists that fails without the fix
- [ ] All existing tests pass
- [ ] Build succeeds
