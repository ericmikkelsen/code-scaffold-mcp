---
name: deprecation-and-migration
description: Manages deprecation and migration. Use when removing old systems, APIs, or features. Use when migrating users from one implementation to another.
---

# Deprecation and Migration

## Overview

Code is a liability, not an asset. Deprecation is the discipline of removing code that no longer earns its keep.

## The Migration Process

1. Build the Replacement
2. Announce and Document
3. Migrate Incrementally
4. Remove the Old System

## Verification

After completing a deprecation:

- [ ] Replacement is production-proven and covers all critical use cases
- [ ] Migration guide exists with concrete steps and examples
- [ ] All active consumers have been migrated (verified by metrics/logs)
- [ ] Old code, tests, documentation, and configuration are fully removed
- [ ] No references to the deprecated system remain in the codebase
