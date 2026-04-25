---
name: documentation-and-adrs
description: Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need.
---

# Documentation and ADRs

## Overview

Document decisions, not just code. The most valuable documentation captures the *why* — the context, constraints, and trade-offs that led to a decision.

## Architecture Decision Records (ADRs)

ADRs capture the reasoning behind significant technical decisions. Store them in `docs/decisions/` with sequential numbering.

### ADR Template

```markdown
# ADR-001: [Title]

## Status
Accepted | Superseded by ADR-XXX | Deprecated

## Date
YYYY-MM-DD

## Context
[Why this decision was needed]

## Decision
[What was decided]

## Alternatives Considered
[What else was considered and why it was rejected]

## Consequences
[The results of this decision]
```

## Verification

After documenting:

- [ ] ADRs exist for all significant architectural decisions
- [ ] README covers quick start, commands, and architecture overview
- [ ] API functions have parameter and return type documentation
- [ ] Known gotchas are documented inline where they matter
- [ ] Rules files (CLAUDE.md etc.) are current and accurate
